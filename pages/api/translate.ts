/* eslint-disable import/no-anonymous-default-export */
export default async function (req: { body: { question: string; }; } , res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { translateText?: any; error?: unknown; }): void; new(): any; }; }; }){

    
      const question = req.body.question || '';
      
      console.log( "get data : ",question)
      // https://chatbot-tr-back.vercel.app/home/translate-to-english
      // http://localhost:9001/home/translate-to-english
    
      try {
        console.log("data save rating: ", question,)
        const response = await fetch('http://localhost:9001/home/translate-to-english', {
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
        console.log("tr :",data.translationsToEng)
        res.status(200).json({ translateText: data.translationsToEng });

    
      } catch (error) {
        res.status(500).json({ error });
      }
    
    }
    