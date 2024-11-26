const API_KEY = process.env.API_KEY

interface CompletionResponse {
    Output: Array<{
        INPUT: string;
        Output1: string;
        Output2: string;
        Output3: string;
        Output4: string;
    }>;
}

export default class Main {
    async fetchCompletions(inputText: string, allmotherbefore: string, allNode: string): Promise<CompletionResponse['Output']> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `**context**
                        I'am a Programmer. I'am writing the website that display the mind map, 
                        User on our website have to Type a input text on the first node of mindmap
                        and then my website will generate another 4 node that have the text inside. 
                        the context of text inside have to related to first node.
                        **key information**
                        so the input text is "${inputText}".
                        Then you have to response in JSON follow as this structure.
                        {
                          "Output":[
                            {
                               "INPUT": "${inputText}",
                               "Output1": "",
                               "Output2": "",
                               "Output3": "",
                               "Output4": ""
                            }
                           ]
                          } 
                        **Role of your**
                        You are my assistant. 
                        1.) You have to response the text that related to first node and these words also : ${allmotherbefore}.
                        2.) You have to response in a short keyword. 
                        3.) Your words must not be the same as the following words : ${allNode}.
                        4.) Do not send the empty value back.
                        `
                    }
                ]
            })
        });

        const data = await response.json();
        if (data && data.choices && data.choices.length > 0) {
            const messageContent = data.choices[0].message.content;
            try {
                const outputData: CompletionResponse = JSON.parse(messageContent);
                return outputData.Output || [];
            } catch (error) {
                console.error('Error parsing response JSON:', error);
                return [];
            }
        } else {
            console.error('Invalid response from OpenAI API');
            return [];
        }
    }
}
