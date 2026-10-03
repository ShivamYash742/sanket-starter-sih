import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/rbac'
import OpenAI from 'openai'

export async function POST(req: Request) {
  requireRole()
  
  try {
    const { text } = await req.json()
    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 })
    }

    const apiKey = process.env.LLM_API_KEY
    if (!apiKey) {
      // Deterministic fallback
      return NextResponse.json({
        name: 'Extracted Project Name',
        sector: 'SEMICONDUCTOR',
        location: 'Sanand',
        investmentCr: 10000,
        projectType: 'Greenfield',
        startDate: new Date().toISOString().split('T')[0],
        operationalDate: new Date(Date.now() + 18*30*24*60*60*1000).toISOString().split('T')[0],
        employer: 'Acme Corp'
      })
    }

    const openai = new OpenAI({
      baseURL: process.env.LLM_BASE_URL || 'https://integrate.api.nvidia.com/v1',
      apiKey: apiKey
    })

    const completion = await openai.chat.completions.create({
      model: process.env.LLM_MODEL || 'nvidia/nemotron-3-super-120b-a12b',
      messages: [
        { role: 'system', content: 'You are an extraction tool. Extract the following fields from the text as a JSON object: name, sector (SEMICONDUCTOR, EV, SOLAR), location, investmentCr (number), projectType, startDate (YYYY-MM-DD), operationalDate (YYYY-MM-DD), employer. If missing, leave empty or use a reasonable guess.' },
        { role: 'user', content: text }
      ],
      response_format: { type: 'json_object' },
      // @ts-expect-error extra_body is valid for Nvidia endpoint
      extra_body: { chat_template_kwargs: { enable_thinking: false } }
    })

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}')
    return NextResponse.json(parsed)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to parse' }, { status: 500 })
  }
}
