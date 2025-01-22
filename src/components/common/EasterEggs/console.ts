import data from '@/assets/json/console.json';

fetch(data.img).then((e => e.blob())).then((e) => {
  const fr = new FileReader();
  fr.onload = ({ target }) =>
    console.info(`%c${data.caption}`, data.style.replace('%url%', target?.result as string));
  fr.readAsDataURL(e);
});
