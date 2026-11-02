import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';

const client = new Client({});

interface DiscoverResult {
  name: string;
  website: string;
  address: string;
  rating: number | null;
}

// Datos de prueba simulados para testear la interfaz antes de configurar la API Key de Google
function getMockProspects(query: string, location: string): DiscoverResult[] {
  const cleanQuery = query.toLowerCase();
  const cleanLoc = location.toLowerCase();

  return [
    {
      name: `${query.charAt(0).toUpperCase() + query.slice(1)} Boutique & Spa`,
      website: 'https://example-boutique.com',
      address: `Av. Principal 1234, ${location}`,
      rating: 4.8,
    },
    {
      name: `Gran ${query.charAt(0).toUpperCase() + query.slice(1)} Central`,
      website: 'https://example-central-suites.com',
      address: `Calle Mayor 450, ${location}`,
      rating: 4.5,
    },
    {
      name: `Casa Urbana ${location.split(',')[0]}`,
      website: 'https://example-casaurbana.com',
      address: `Boulevard Sol 890, ${location}`,
      rating: 4.2,
    },
    {
      name: `Plaza Colonial ${query.charAt(0).toUpperCase() + query.slice(1)}`,
      website: 'https://example-plazacolonial.com',
      address: `Paseo Las Palmas 320, ${location}`,
      rating: 4.6,
    },
    {
      name: `${query.charAt(0).toUpperCase() + query.slice(1)} Del Río`,
      website: 'https://example-delrio.com',
      address: `Costanera Norte 112, ${location}`,
      rating: 3.9,
    },
  ];
}

async function handleDiscover(query?: string | null, location?: string | null, isDemo?: boolean) {
  if (!query || !location || !query.trim() || !location.trim()) {
    return NextResponse.json(
      { error: 'Los parámetros "query" (rubro) y "location" (zona) son obligatorios.' },
      { status: 400 }
    );
  }

  const cleanQuery = query.trim();
  const cleanLocation = location.trim();
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // Si se solicita explícitamente modo demo o no hay API key y se activó demo
  if (isDemo) {
    return NextResponse.json(getMockProspects(cleanQuery, cleanLocation));
  }

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('placeholder') || apiKey.includes('YOUR_')) {
    return NextResponse.json(
      {
        error: 'GOOGLE_MAPS_API_KEY no está configurada. Por favor agregala en tu archivo .env.local y en las variables de entorno de Vercel.',
        code: 'MISSING_API_KEY',
      },
      { status: 400 }
    );
  }

  try {
    const searchQuery = `${cleanQuery} in ${cleanLocation}`;

    // Paso 3.2: Uso del SDK de Google Maps (Client.textSearch)
    const response = await client.textSearch({
      params: {
        query: searchQuery,
        key: apiKey,
      },
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      const errMsg = response.data.error_message || response.data.status;
      return NextResponse.json(
        { error: `Google Places API respondió con error: ${errMsg}` },
        { status: 502 }
      );
    }

    const rawResults = response.data.results || [];

    if (rawResults.length === 0) {
      return NextResponse.json([]);
    }

    // El endpoint clásico TextSearch de Google Maps no siempre retorna el campo website de forma directa.
    // Consultamos placeDetails para los candidatos principales para obtener su sitio web oficial.
    const placesWithDetails = await Promise.all(
      rawResults.slice(0, 20).map(async (place) => {
        if (place.website) {
          return place;
        }

        if (!place.place_id) {
          return place;
        }

        try {
          const detailRes = await client.placeDetails({
            params: {
              place_id: place.place_id,
              fields: ['name', 'website', 'formatted_address', 'rating'],
              key: apiKey,
            },
          });

          return {
            ...place,
            website: detailRes.data.result?.website || place.website,
          };
        } catch {
          return place;
        }
      })
    );

    // Paso 3.3: Filtra los resultados: solo los que tengan el campo website
    // Paso 3.4: Devuelve un JSON con [{ name, website, address, rating }]
    const filteredProspects: DiscoverResult[] = placesWithDetails
      .filter((p) => typeof p.website === 'string' && p.website.trim().length > 0)
      .map((p) => ({
        name: p.name || 'Sin nombre',
        website: p.website!.trim(),
        address: p.formatted_address || '',
        rating: typeof p.rating === 'number' ? p.rating : null,
      }));

    return NextResponse.json(filteredProspects);
  } catch (err: any) {
    console.error('Error al consultar Google Places API:', err);
    return NextResponse.json(
      { error: err.message || 'Error inesperado al conectar con Google Places API.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, location, demo } = body;
    return await handleDiscover(query, location, Boolean(demo));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Formato de solicitud inválido.' },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const location = searchParams.get('location');
    const demo = searchParams.get('demo') === 'true';

    return await handleDiscover(query, location, demo);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al procesar parámetros de búsqueda.' },
      { status: 400 }
    );
  }
}
