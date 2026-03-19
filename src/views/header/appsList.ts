import _archives_logo from '@/assets/crdoy0js-removebg-preview.webp';
import _media_logo from '@/assets/5a229b479641b7.26338722151221741.webp';
import _group_speak_logo from '@/assets/group_speak.webp';
import { AppItem } from '@/types';

const appsList: AppItem[] = [
    {
        name: 'Archives',
        src: _archives_logo,
        href: '/apps/archives',
        permissions: ['archives']
    },
    {
        name: 'Lisolo na budget',
        src: _group_speak_logo,
        href: '/apps/lisolonabudget',
        permissions: []
    },
    {
        name: 'Mediathèque',
        src: _media_logo,
        href: '/apps/medialibrary',
        permissions: ['library', 'image_library', 'film_library'],
    },
];

export default appsList;
