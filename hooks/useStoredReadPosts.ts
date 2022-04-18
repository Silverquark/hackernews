import { useEffect, useState } from 'react';
import { useAsyncStorage } from "@react-native-async-storage/async-storage";


export default function useStoredReadPosts() {

  const { getItem, setItem } = useAsyncStorage(`ReadPosts`);

  const [ readPosts, setReadPosts ] = useState<number[]>([]);

  const readNews = getItem().then((json) => {
    if ((json ?? "").length < 1) json = null; 
    return JSON.parse(json ?? "[]") as number[];
  });

  useEffect(() => {
    async function asyncStuff() {
      setReadPosts(await readNews);
    }

    asyncStuff()
  }, []);

  const addReadPosts = async (id : number) => {
    setReadPosts([...readPosts, id]);
    setItem(JSON.stringify(readPosts));  
  }

  return {readPosts, addReadPosts};
}
