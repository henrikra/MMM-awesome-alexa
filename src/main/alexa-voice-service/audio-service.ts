import * as fs from "fs";
import * as request from "request";

const url = "https://access-alexa-na.amazon.com/v1/avs/speechrecognizer/recognize";

export class AudioService {

    constructor(private cwd: string) {
    }

    public sendAudio(token: string, file: fs.ReadStream): Promise<void> {
        const stream = fs.createWriteStream(`${this.cwd}/temp/output.mpeg`);

        return new Promise<void>((resolve, reject) => {

            request.post({
                uri: url,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                formData: {
                    metadata: {
                        value: JSON.stringify({
                            messageHeader: {},
                            messageBody: {
                                profile: "alexa-close-talk",
                                locale: "en-us",
                                format: "audio/L16; rate=16000; channels=1",
                            },
                        }),
                        options: {
                            "Content-Disposition": 'form-data; name="metadata"',
                            "Content-Type": "application/json; charset=UTF-8",
                        },
                    },
                    audio: {
                        value: file,
                        options: {
                            "Content-Type": "audio/L16; rate=16000; channels=1",
                            "Content-Disposition": 'form-data; name="audio"',
                        },
                    },
                },
            }, (err, response, body) => {
                if (err !== null) {
                    reject(err);
                    return;
                }

                if (response.statusCode < 200 || response.statusCode >= 300) {
                    reject(body);
                    return;
                }
            }).pipe(stream);

            stream.on("finish", () => {
                resolve();
            });
        });
    }
}