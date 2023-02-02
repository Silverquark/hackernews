import axios from "axios";
import * as React from "react";
import {
  FlatList,
  StyleSheet,
  RefreshControl,
  VirtualizedList,
} from "react-native";
import { useQuery } from "react-query";
import { useScrollToTop } from "@react-navigation/native";

import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../types";
import NewsEntry from "./NewsEntry";

import useStoredReadPosts from "../hooks/useStoredReadPosts";

export default function TabOneScreen({ route }: RootTabScreenProps<"TabOne">) {
  const [refreshing, setRefreshing] = React.useState(false);
  const { isLoading, isRefetching, isError, data, error, refetch } = useQuery<
    number[] | undefined
  >(`${route.params.type}posts`, getPosts);

  const ref = React.useRef(null);

  useScrollToTop(ref);

  const { readPosts, addReadPosts } = useStoredReadPosts();

  const wait = (timeout: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  };

  const getRead = (id: number) => {
    return readPosts.includes(id);
  };

  async function getPosts() {
    try {
      const response = await axios.get<number[]>(route.params.url);
      if (response.status !== 200) {
        throw new Error("Problem fetching data");
      }
      return response.data as number[];
    } catch (error) {
      console.error(error);
    }
  }

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await wait(300);
    refetch();
    setRefreshing(false);
  }, []);

  const renderItem = ({ item, index }: { item: number; index: number }) => (
    <NewsEntry
      newsID={item}
      getRead={getRead}
      storeRead={addReadPosts}
      even={Boolean(index % 2)}
    />
  );

  return (
    <View style={styles.container}>
      {isLoading && <Text style={{ width: '100%', textAlign: 'center'}}>Loading...</Text>}
      {isError && <Text>{`Error: ${error}`}</Text>}
      {!(isLoading || isRefetching) && !isError && (
        <VirtualizedList
          keyExtractor={(item: number) => item.toString()}
          ref={ref}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={data}
          renderItem={renderItem}
          getItemCount={() => data?.length ?? 0}
          getItem={(data, index) => data[index]}
          initialNumToRender={10}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: 'stretch',
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
