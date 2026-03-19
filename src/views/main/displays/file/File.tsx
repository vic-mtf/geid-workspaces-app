import Doc from '@/views/main/displays/file/Doc';
import Photo from '@/views/main/displays/file/Photo';
import Video from '@/views/main/displays/file/Video';

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
