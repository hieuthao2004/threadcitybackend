import algoliasearch from 'algoliasearch';

const client = algoliasearch('7C5YDKSGYW', '186a9ba283ae350d078375091c0804a1');
const index = client.initIndex('posts');

export default index;
