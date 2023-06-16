import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Image from 'next/image';
import LoadingDots from '@/components/ui/LoadingDots';
import { AiOutlineClose, AiOutlineSend } from 'react-icons/ai';
import { Document } from 'langchain/document';

export default function Chatbot() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: 'Hi, what would you like to learn about DFCC Bank?',
        type: 'apiMessage',
      },
    ],
    history: [],
    pendingSourceDocs: [],
  });
  const { messages, pending, history, pendingSourceDocs } = messageState;
  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [id, setId] = useState('');
  const [checkNotSure, setCheckNotSure] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [showChatRating, setShowChatRating] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentInfoMsg, setAgentInfoMsg] = useState(false);
  const [agentImage, setAgentImage] = useState('/chat-header.png');
  const [greeting, setGreeting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Sinhala'); //English
  const [closeState, setCloseState] = useState(false);


  useEffect(() => {
    const now = Date.now();
    const newId = now.toString();
    setId(newId);
  }, []);
  // console.log('user id : ',id)

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);
  useEffect(() => {
    
  }, [selectedLanguage]);

  useEffect(() => {
    // console.log("text there : ", checkNotSure)
  }, [checkNotSure, agentName, agentInfoMsg, agentImage, greeting]);

  let finalMessage = '';
  let text = '';
  // translate to language
  async function translateToLanguage(text: any) {
    console.log('question : ', text);

    const response = await fetch('/api/translateToLanguage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: text,
        language: selectedLanguage,
      }),
    });
    const questionEnglishresponse = await response.json();
    finalMessage = questionEnglishresponse.languageText[0];
    console.log('questionLanguage: ', finalMessage);
  }

  //handle form submission
  async function handleSubmit(e: any) {
    // if (liveAgent === false) {
    e.preventDefault();

    let engQuestion = '';

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    // set user message array
    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
      pending: undefined,
    }));

    // get user message
    let question = query.trim();
    console.log('1 :', question);
    try {
      console.log('question : ', question);

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
        }),
      });
      const questionEnglishresponse = await response.json();
      engQuestion = questionEnglishresponse.translateText[0];
      console.log('questionEnglish: ', engQuestion);
    } catch (error) {
      console.error(error);
    }
    console.log('1 :', engQuestion);

    setLoading(true);
    setQuery('');
    setMessageState((state) => ({ ...state, pending: '' }));

    const ctrl = new AbortController();

    if (engQuestion !== '') {
      const response = await fetch('/api/botInformationCheck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: engQuestion }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      const matchedGreetingType = data.info_result;
      console.log('matchedGreetingType : ', matchedGreetingType);

      if (matchedGreetingType.toLowerCase().includes('name')) {
        text = 'My name is DFCC GPT.'
        await translateToLanguage(text);
        setTimeout(() => {
          setMessageState((state) => ({
            ...state,
            messages: [
              ...state.messages,
              {
                type: 'apiMessage',
                message: finalMessage,
              },
            ],
            pending: undefined,
          }));
          setLoading(false);
        }, 3000);
      } else if (matchedGreetingType.toLowerCase().includes('age')) {
        text = "I'm 20 years old"
        await translateToLanguage(text);
        setTimeout(() => {
          setMessageState((state) => ({
            ...state,
            messages: [
              ...state.messages,
              {
                type: 'apiMessage',
                message: finalMessage,
              },
            ],
            pending: undefined,
          }));
          setLoading(false);
        }, 3000);
      } else if (matchedGreetingType.toLowerCase().includes('country')) {
        text = 'I live in Sri Lanka'
        await translateToLanguage(text);
        setTimeout(() => {
          setMessageState((state) => ({
            ...state,
            messages: [
              ...state.messages,
              {
                type: 'apiMessage',
                message: finalMessage,
              },
            ],
            pending: undefined,
          }));
          setLoading(false);
        }, 3000);
      } else {
        const response = await fetch('/api/generateGreeting', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: engQuestion }),
        });

        const data = await response.json();
        if (response.status !== 200) {
          throw (
            data.error ||
            new Error(`Request failed with status ${response.status}`)
          );
        }
        const isGreet = data.greet_result;
        console.log('isGreet : ', isGreet);

        if (isGreet.toLowerCase().includes('yes')) {
          try {
            const response = await fetch('/api/generate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ question: engQuestion }),
            });

            const data = await response.json();
            if (response.status !== 200) {
              throw (
                data.error ||
                new Error(`Request failed with status ${response.status}`)
              );
            }

            await translateToLanguage(data.result);
            setMessageState((state) => ({
              ...state,
              messages: [
                ...state.messages,
                {
                  type: 'apiMessage',
                  message: data.result,
                },
              ],
              pending: undefined,
            }));
            setLoading(false);
          } catch (error) {
            console.error(error);
          }
        } else {
          try {
            fetchEventSource('/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                question,
                history,
              }),
              signal: ctrl.signal,
              onmessage: async (event) => {
                if (event.data === '[DONE]') {
                  await translateToLanguage(pending ?? '');
                  setMessageState((state) => ({
                    history: [
                      ...state.history,
                      [question, state.pending ?? ''],
                    ],
                    messages: [
                      ...state.messages,
                      {
                        type: 'apiMessage',
                        message: finalMessage,
                        sourceDocs: state.pendingSourceDocs,
                      },
                    ],
                    pending: undefined,
                    pendingSourceDocs: undefined,
                  }));
                  setLoading(false);
                  ctrl.abort();
                } else {
                  const data = JSON.parse(event.data);
                  if (data.sourceDocs) {
                    setMessageState((state) => ({
                      ...state,
                      pendingSourceDocs: data.sourceDocs,
                    }));
                  } else {
                    setMessageState((state) => ({
                      ...state,
                      pending: (state.pending ?? '') + data.data,
                    }));
                  }
                }
              },
            });
          } catch (error) {
            setLoading(false);
            setError(
              'An error occurred while fetching the data. Please try again.',
            );
            console.log('error', error);
          }
        }
      }
    }
  }

  const handleCloseChat = async () => {
    setCloseState(true)

    // const response = await fetch('https://solutions.it-marketing.website/chat-close-by-user', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ chatId: id }),
    // });

    // if (response.status !== 200) {
    //   const error = await response.json();
    //   throw new Error(error.message);
    // }
    // const data = await response.json();
    // console.log(data.success)

    // if (data.success === 'success') {
    //   setShowChatRating(true)
    // }
    // else {
    //   setShowChatRating(false)
    // }
  }

  //prevent empty submissions
  const handleEnter = useCallback(
    (e: any) => {
      if (e.key === 'Enter' && query) {
        handleSubmit(e);
        // handleLiveAgent(e);
      } else if (e.key == 'Enter') {
        e.preventDefault();
      }
    },
    [query],
  );

  const chatMessages = useMemo(() => {
    return [
      ...messages,
      ...(pending
        ? [
            {
              type: 'apiMessage',
              message: pending,
              sourceDocs: pendingSourceDocs,
            },
          ]
        : []),
    ];
  }, [messages, pending, pendingSourceDocs]);
  // console.log(messages);

  // console.log('messages : ', messages);

  //scroll to bottom of chat
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [chatMessages]);

  console.log(messages);

  return (
    <Layout>
      {/* chat top header =======================*/}
      <div className={`${styles.chatTopBar} d-flex flex-row `}>
        <div className="col-12 text-center d-flex flex-row justify-content-between px-2">
          <Image src="/chat-top-bar.png" alt="AI" width={150} height={30} />
          <button className='close-button' onClick={handleCloseChat} title="Close Chat"><AiOutlineClose /> </button>
        </div>
      </div>
      {/* chat top header end =======================*/}

      <div ref={messageListRef} className={`${styles.messageWrapper}`}>







        {/* language switch message =================*/}
        <div className={styles.botMessageContainerWrapper}>

          <div className="d-flex justify-content-center pt-1">
            <Image src="/chat-logo.png" alt="AI" width={180} height={50} />
          </div>

          <div
            className={`${styles.botChatMsgContainer} d-flex flex-column my-2`}
          >
            <div className="d-flex">
              <Image src="/chat-header.png" alt="AI" width="40" height="40" />
            </div>
            <div className={`d-flex flex-column py-3`}>
              <div
                className={`welcomeMessageContainer d-flex flex-column align-items-center`}
              >
                <Image
                  src="/language-img.png"
                  alt="AI"
                  width={220}
                  height={150}
                />
                <p className="mt-2">
                  Hello, Welcome to DFCC Bank. Please select the language to get
                  started.
                </p>
                <p className="">
                  مرحبًا بكم في DFCC Bank. يرجى تحديد اللغة للبدء.
                </p>

                <div className="d-flex flex-row welcome-language-select w-100">
                  <div className="col-6 p-1">
                    <button
                      className=" px-3 py-2 rounded"
                      onClick={() => {
                        setSelectedLanguage('English');
                        setMessageState((state) => ({
                          ...state,
                          messages: [
                            ...state.messages,
                            {
                              type: 'apiMessage',
                              message: 'Please ask your question in English.',
                            },
                          ],
                          pending: undefined,
                        }));
                      }}
                    >
                      English
                    </button>
                  </div>
                  <div className="col-6 p-1">
                    <button
                      className="px-3 py-2 rounded"
                      onClick={() => {
                        setSelectedLanguage('Arabic');
                        setMessageState((state) => ({
                          ...state,
                          messages: [
                            ...state.messages,
                            {
                              type: 'apiMessage',
                              message: 'الرجاء طرح سؤالك باللغة الإنجليزية.',
                            },
                          ],
                          pending: undefined,
                        }));
                      }}
                    >
                      Arabic
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        {/* language switch message end =================*/}





        {/* message conversation container =================*/}
        <div
          className={`${styles.messageContentWrapper} d-flex flex-column`}
        >




          {/* user and api messages =================*/}
          {chatMessages.map((message, index) => {

            if (message.type !== 'apiMessage' && message.type !== 'userMessage') {
              // skip rendering if the message type is not 'apiMessage' or 'userMessage'
              return null;
            }
            let icon;
            let className;
            let userHomeStyles;
            let wrapper = 'align-items-end justify-content-end';
            let userStyles = 'justify-content-end flex-row-reverse float-end';

            if (message.type === 'apiMessage') {
              {
                icon = (
                  <Image
                    src="/chat-header.png"
                    alt="AI"
                    width="40"
                    height="40"
                    className={styles.botImage}
                    priority
                  />
                );
              }
              className = styles.apimessage;
              userStyles = 'justify-content-start flex-row float-start';
              wrapper = 'align-items-start justify-content-start';

            } else if (message.type === 'userMessage') {
              icon = (
                <Image
                  src="/user.png"
                  alt="Me"
                  width="40"
                  height="40"
                  className={styles.botImage}
                  priority
                />
              );
              userHomeStyles = styles.userApiStyles;
              className =
                loading && index === chatMessages.length - 1
                  ? styles.usermessagewaiting
                  : styles.usermessage;
            } else {

            }
            const notSureMessages = ["Hmm, I'm not sure", "I'm sorry", "There is no question", "أنا آسف", "هم، لست متأكدا", "من دون شك"];
            const isLastApiMessageWithNotSure =
              message.type === 'apiMessage' &&
              notSureMessages.some((text) => message.message.includes(text)) &&
              index === chatMessages.length - 1;

            return (
              <>
                <div
                  key={`chatMessage-${index}`}
                  className={styles.botMessageContainerWrapper}
                >
                  <div
                    className={`${styles.botChatMsgContainer} ${userStyles} d-flex my-2`}
                  >
                    <div className="d-flex">
                      {icon}
                    </div>
                    <div className={`${wrapper} d-flex flex-column ms-2`}>
                      <div
                        className={`${styles.botMessageContainer} ${userHomeStyles} d-flex flex-column my-1`}
                      >
                        <p className="mb-0">{message.message}</p>
                        {/* {message.type === 'apiMessage' && trMsg && (
                          <div
                            className={`${styles.botMessageContainer} ${styles.apimessage} d-flex flex-column my-1`}
                          >
                            <p className="mb-0">{trMsg}</p>
                          </div>
                        )} */}
                        {isLastApiMessageWithNotSure && (
                          <button
                            className={`bg-dark rounded text-white py-2 px-3 my-3`}
                            style={{ width: 'max-content', alignSelf: 'center' }}
                          >
                            Connect with Live Agent
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                </div>

              </>
            );
          })}

        </div>
      </div>
      {/* message conversation container end =================*/}





      {/* input fields =================*/}
      <div className={`${styles.inputContainer}`}>
        <textarea
          disabled={loading}
          onKeyDown={handleEnter}
          ref={textAreaRef}
          autoFocus={false}
          rows={1}
          maxLength={512}
          id="userInput"
          name="userInput"
          placeholder={
            loading
              ? 'Waiting for response...'
              : 'What is this question about?'
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.textarea}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`${styles.inputIconContainer} `}
        >
          {loading ? (
            <div className={styles.loadingwheel}>
              <LoadingDots color="#fff" />
            </div>
          ) : (
            // Send icon SVG in input field
            <AiOutlineSend className={styles.sendIcon} />
          )}
        </button>
      </div>
      {error && (
        <div className="border border-red-400 rounded-md p-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      {/* input fields end ================= */}
    </Layout>
  );
}
