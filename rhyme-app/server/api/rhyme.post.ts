import OpenAI from 'openai'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { word } = await readBody(event)

  
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
あなたは日本語の「韻」(子音＋母音パターンの完全一致) を専門とする言語学者 AI です。

◆タスク
与えられたひらがな語 (元語) と **同じ文字数** で
**各文字の子音＋母音並びが完全に一致** する、
辞書に載る一般的な日本語 (固有名詞・造語・当て字不可)を10個提案してください。

◆厳密ルール
1. 元語と **同じ文字数** であること。
2. 各文字の **子音＋母音の組み合わせ** がすべて一致していること  
   例: さけのみ (S-A, K-E, N-O, M-I) → かけこみ (K-A, K-E, K-O, M-I)
3. **辞書に存在する一般名詞・動詞・形容詞** に限る。俗語・固有名詞・造語は不可。
4. 韻説明は1行で簡潔に。
5.同じ言葉は表示しない
6.同じ発音の言葉は対象外
7.辞書に存在しない言葉は対象外
回答形式:
[提案する言葉] - [簡潔な意味説明]

    `

    // const completion = await openai.chat.completions.create({
    //   model: 'gpt-4o-mini',
    //   messages: [
    //     {
    //       role: 'system',
    //       content: 'さけのみたてこみのように子音から母音まで一致させた意味ある言葉を提案して'
    //     },
    //     {
    //       role: 'user',
    //       content: prompt
    //     }
    //   ],
    //   max_tokens: 800,
    //   temperature: 0.7
    // })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',   // or gpt-4o
      messages: [
        { role: 'system', content: prompt },
        { role: 'user',   content: word }
      ],
      temperature: 0.25,
      max_tokens: 512
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


// export default defineEventHandler(async (event) => {
//   const { openaiApiKey } = useRuntimeConfig()
//   const { word } = await readBody(event)

//   if (!word) throw createError({ statusCode: 400, statusMessage: '韻を踏む元の言葉が必要です。' })
//   if (!openaiApiKey) throw createError({ statusCode: 500, statusMessage: 'OpenAI APIキー未設定' })

//      const prompt = `
// あなたは日本語の「韻」(子音＋母音パターンの完全一致) を専門とする言語学者 AI です。

// ◆タスク
// 与えられたひらがな語 (元語) と **同じ文字数** で
// **各文字の子音＋母音並びが完全に一致** する、
// 辞書に載る一般的な日本語 (固有名詞・造語・当て字不可)を提案してください。

// ◆厳密ルール
// 1. 元語と **同じ文字数** であること。
// 2. 各文字の **子音＋母音の組み合わせ** がすべて一致していること  
//    例: さけのみ (S-A, K-E, N-O, M-I) → かけこみ (K-A, K-E, K-O, M-I)
// 3. **辞書に存在する一般名詞・動詞・形容詞** に限る。俗語・固有名詞・造語は不可。
// 4. 韻説明は1行で簡潔に。
// 5.同じ言葉は表示しない
// 回答形式:
// 1. [提案する言葉] - [簡潔な意味説明]
// 2. [提案する言葉] - [簡潔な意味説明]
//     `

//   const openai = new OpenAI({ apiKey: openaiApiKey })

//   const completion = await openai.chat.completions.create({
//     model: 'gpt-4o-mini',   // or gpt-4o
//     messages: [
//       { role: 'system', content: prompt },
//       { role: 'user',   content: word }
//     ],
//     temperature: 0.25,
//     max_tokens: 512
//   })

//   const json = JSON.parse(completion.choices[0].message.content ?? '{}')

//   return { success: true, data: json, timestamp: new Date().toISOString() }
// })
