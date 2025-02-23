import { v4 as uuidv4 } from 'uuid';

function makeSession_uuid(): string {
    const uuid:string = uuidv4();
    return uuid;
}

export default makeSession_uuid;