/* eslint-disable import/no-anonymous-default-export */
export default async function (req: { body: {
    [x: string]: string; chatId: string; rating: string; inputValue: string; 
}; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { success?: any; error?: unknown; }): void; new(): any; }; }; }){


  const question = req.body.question || '';
  const language = req.body.language || '';
  
  console.log( "get data : ",question)
  console.log( "language : ",language)
  // https://chatbot-tr-back.vercel.app/home/translate-to-english
  // http://localhost:9001/home/translate-to-english

  try {
    console.log("data : ", question, language)
    const response = await fetch('https://chatbot-tr-back.vercel.app/home/translate-to-selected-language', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
      }),
    });

    if (response.status !== 200) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    console.log("tr si :",data.translationsToEng)
    res.status(200).json({ success: data.translationsToEng });


  } catch (error) {
    res.status(500).json({ error });
  }

}
