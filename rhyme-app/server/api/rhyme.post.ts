import OpenAI from 'openai'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  
  if (!body.word) {
    throw createError({
      statusCode: 400,
      statusMessage: '韻を踏む元の言葉が必要です。'
    })
  }

  if (!config.openaiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenAI APIキーが設定されていません。'
    })
  }

  try {
    const openai = new OpenAI({
      apiKey: config.openaiApiKey
    })

    const prompt = `
次の日本語の単語と韻を踏む（音が似ている）日本語の言葉を5つ提案してください。
提案する言葉は実在する日本語の単語で、元の言葉とは異なる意味を持つものにしてください。

元の言葉: "${body.word}"

回答形式:
1. [提案する言葉] - [簡潔な意味説明]
2. [提案する言葉] - [簡潔な意味説明]
...

韻の踏み方の説明も簡潔に含めてください。
    `

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'さけのみたてこみのように子音から母音まで一致させた意味ある言葉を提案して'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw createError({
        statusCode: 500,
        statusMessage: 'OpenAIからの応答を取得できませんでした。'
      })
    }

    return {
      success: true,
      data: {
        word: body.word,
        rhymes: response,
        timestamp: new Date().toISOString()
      }
    }

  } catch (error: any) {
    console.error('OpenAI API Error:', error)
    
    if (error.code === 'insufficient_quota') {
      throw createError({
        statusCode: 429,
        statusMessage: 'APIの利用制限に達しました。しばらく時間をおいてから再試行してください。'
      })
    }
    
    if (error.code === 'invalid_api_key') {
      throw createError({
        statusCode: 401,
        statusMessage: 'OpenAI APIキーが無効です。'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: `韻の生成中にエラーが発生しました: ${error.message}`
    })
  }
})