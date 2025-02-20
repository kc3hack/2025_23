import crypto from 'crypto';

function makeSession_uuid(): string {

    const GetNumber:number=10;
    //ここで現在の日付を取得
    const now = new Date();
    const timeKey = `${now.getUTCFullYear()}${(now.getUTCMonth() + 1).toString().padStart(2, '0')}${now.getUTCDate().toString().padStart(2, '0')}${now.getUTCHours().toString().padStart(2, '0')}${now.getUTCMinutes().toString().padStart(2, '0')}`;

    // ハッシュ化 (SHA-256)
    const hash = crypto.createHash('sha256').update(timeKey).digest('hex');

    return hash.substring(0,GetNumber);
}

export default makeSession_uuid;