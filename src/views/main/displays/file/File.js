import Doc from './Doc';
import Photo from './Photo';
import Video from './Video';

export default function File (props) {
    if(props.type === 'image')
        return <Photo {...props} />
    if(props.type === 'document')
        return <Doc {...props} />
    if(props.type === 'video')
        return <Video {...props} />
}

