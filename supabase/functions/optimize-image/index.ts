import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, targetWidth, targetHeight } = await req.json()

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    // Calculate required upscaling
    const currentDimensions = await getImageDimensions(image)
    const upscaleFactor = Math.max(
      targetWidth / currentDimensions.width,
      targetHeight / currentDimensions.height
    )

    // Only optimize if image is too small
    if (upscaleFactor > 1.2) {
      // Use DALL-E for upscaling and enhancement
      const response = await openai.createImageVariation(
        image,
        1,
        `${targetWidth}x${targetHeight}`,
        "standard",
        "image"
      )

      const optimizedImage = response.data.data[0].url

      return new Response(
        JSON.stringify({ optimizedImage }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // If image is already good quality, return original
    return new Response(
      JSON.stringify({ optimizedImage: image }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function getImageDimensions(base64Image: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      })
    }
    img.src = base64Image
  })
}