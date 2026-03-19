import Doc from './Doc';
import Photo from './Photo';
import Video from './Video';

interface FileProps {
    type?: string;
    [key: string]: any;
}

export default function File (props: FileProps) {
    if(props.type === 'image')
        return <Photo {...props} />
    if(props.type === 'document')
        return <Doc {...props} />
    if(props.type === 'video')
        return <Video {...props} />
    return null;
}
