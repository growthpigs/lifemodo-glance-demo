import { NextRequest, NextResponse } from 'next/server'

// Nano Banana Pro — image transformation prompts per style
const STYLE_PROMPTS: Record<string, string> = {
  christmas:
    'Cinematic Paris street at night, heavy snowfall, warm golden fairy lights draped on every building, Christmas garlands across the road, soft bokeh, Haussmann architecture, magical festive atmosphere, photorealistic, 8k',
  rave: 'Same street transformed into a massive outdoor rave party, neon laser lights in purple and cyan, enormous speakers, holographic projections on buildings, hundreds of people dancing, cyberpunk energy, night scene, photorealistic, 8k',
  jelly:
    'Same street transformed into a surreal Pixar-style jelly world, buildings made of translucent wobbly gelatin, candy-cane streetlamps, rainbow jelly cobblestones, whimsical and playful, soft lighting, photorealistic render, 8k',
}

// Demo placeholder images (used when Nano Banana key not configured)
const DEMO_FALLBACKS: Record<string, string> = {
  christmas:
    'https://images.unsplash.com/photo-1543589077-47d816067fbf?q=80&w=1200&auto=format&fit=crop',
  rave: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
  jelly:
    'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=1200&auto=format&fit=crop',
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const photo = formData.get('photo') as File | null
    const style = (formData.get('style') as string) || 'christmas'

    if (!photo) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 })
    }

    const prompt = STYLE_PROMPTS[style] ?? STYLE_PROMPTS.christmas
    const nanoBananaKey = process.env.NANO_BANANA_API_KEY

    let imageUrl: string

    if (nanoBananaKey) {
      // ── Real Nano Banana / Replicate call ───────────────────────────────────
      const photoBuffer = Buffer.from(await photo.arrayBuffer())
      const base64Image = `data:${photo.type};base64,${photoBuffer.toString('base64')}`

      const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          Authorization: `Token ${nanoBananaKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: process.env.NANO_BANANA_MODEL_VERSION ?? 'stability-ai/sdxl',
          input: {
            prompt,
            image: base64Image,
            prompt_strength: 0.7,
            num_inference_steps: 30,
          },
        }),
      })

      const prediction = await replicateRes.json()

      // Poll for completion (max 60s)
      let output = prediction.output
      let pollUrl = prediction.urls?.get
      let attempts = 0
      while (!output && pollUrl && attempts < 30) {
        await new Promise((r) => setTimeout(r, 2000))
        const poll = await fetch(pollUrl, {
          headers: { Authorization: `Token ${nanoBananaKey}` },
        })
        const result = await poll.json()
        output = result.output
        if (result.status === 'failed') break
        attempts++
      }

      imageUrl = Array.isArray(output) ? output[0] : (output ?? DEMO_FALLBACKS[style])
    } else {
      // ── Demo mode: return placeholder immediately ────────────────────────────
      imageUrl = DEMO_FALLBACKS[style] ?? DEMO_FALLBACKS.christmas
    }

    // ── Async: send to Slack channel (fire-and-forget) ──────────────────────
    const slackWebhook = process.env.SLACK_STREET_WEBHOOK
    if (slackWebhook) {
      fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🎨 Street Transform complete! Style: *${style}* — <${imageUrl}|View image>`,
          unfurl_links: true,
        }),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, imageUrl, style })
  } catch (err) {
    console.error('[street-transform]', err)
    return NextResponse.json({ error: 'Transform failed' }, { status: 500 })
  }
}
