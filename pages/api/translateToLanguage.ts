/* eslint-disable import/no-anonymous-default-export */
export default async function (req: { body: { question: string; selectedLanguage: string; }; } , res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { languageText?: any; error?: unknown; }): void; new(): any; }; }; }){


  const question = req.body.question || '';
  const language = req.body.selectedLanguage || '';
  
  console.log( "get data : ",question)
  console.log( "language : ",language)
  // https://chatbot-tr-back.vercel.app/home/translate-to-english
  // http://localhost:9001/home/translate-to-english

  try {
    console.log("data : ", question, language)
    const response = await fetch('http://localhost:9001/home/translate-to-selected-language', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        language: language
      }),
    });

    if (response.status !== 200) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    console.log("tr si :",data.translationsToLanguage)
    res.status(200).json({ languageText: data.translationsToLanguage });


  } catch (error) {
    res.status(500).json({ error });
  }

}
