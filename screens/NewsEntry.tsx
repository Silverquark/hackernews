import axios from "axios";
import * as React from "react";
import { StyleSheet, TouchableHighlight, View } from "react-native";
import { useQuery } from "react-query";
import * as WebBrowser from "expo-web-browser";

import { Text } from "../components/Themed";
import useColorScheme from "../hooks/useColorScheme";
import Colors from "../constants/Colors";
import { useEffect, useState } from "react";
import moment from "moment";
import { MaterialIcons } from "@expo/vector-icons";

interface Props {
  newsID: number;
  storeRead: (id: number) => void;
  getRead: (id: number) => boolean;
  even: boolean;
}

interface News {
  by: string;
  descendants: number;
  id: number;
  kids: number[];
  score: number;
  time: number;
  title: string;
  type: "story";
  url: string;
}

export default function NewsEntry({ newsID, getRead, storeRead, even }: Props) {
  const colorScheme = useColorScheme();
  const [read, setRead] = useState(false);

  async function getNews(newsID: number) {
    try {
      const response = await axios.get<News>(
        `https://hacker-news.firebaseio.com/v0/item/${newsID}.json`
      );
      if (response.status !== 200) {
        throw new Error("Problem fetching data");
      }
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    setRead(getRead(newsID));
  }, []);

  const { isLoading, isError, data, error } = useQuery<News | undefined>(
    ["news", newsID],
    () => getNews(newsID)
  );

  const getUrlName = (url: string | undefined): string => {
    if (url == undefined) return "";
    let domain = new URL(url);
    let strDomain = domain.host;
    strDomain = strDomain.replace("www.", "");
    return strDomain;
  };

  const openWebBrowser = async (url: string) => {
    storeRead(newsID);
    setRead(true);
    if (url == "") return;
    await WebBrowser.openBrowserAsync(url, {
      controlsColor: Colors[colorScheme].tint,
      dismissButtonStyle: "done",
      toolbarColor: Colors[colorScheme].background,
    });
  };

  var timeSince = moment((data?.time ?? 0) * 1000).fromNow();

  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        backgroundColor: even ? Colors[colorScheme].background : Colors[colorScheme].backgroundLight,
      }}
    >
      <TouchableHighlight
        style={styles.container}
        underlayColor={Colors[colorScheme].tint}
        onPress={() => {
          openWebBrowser(data?.url ?? "");
        }}
      >
        <>
          {isLoading && <Text>Loading...</Text>}
          {isError && <Text>{`Error: ${error}`}</Text>}
          {!isLoading && !isError && (
            <>
              <Text
                style={[
                  styles.title,
                  {
                    color: read
                      ? Colors[colorScheme].textLight
                      : Colors[colorScheme].text,
                  },
                ]}
              >
                {data?.title}
              </Text>
              <Text
                style={[styles.stats, { color: Colors[colorScheme].textLight }]}
              >
                {`${data?.score} points ∘ by ${data?.by} ∘ ${data?.descendants} comments ∘ ${timeSince}`}
              </Text>
            </>
          )}
        </>
      </TouchableHighlight>
      <TouchableHighlight
        underlayColor={Colors[colorScheme].tint}
        onPress={() => {
          openWebBrowser(data?.url ?? "");
        }}
        style={{
          justifyContent: "center",
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <MaterialIcons
          name="comment"
          size={28}
          color={Colors[colorScheme].tabIconDefault}
          style={{}}
        />
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingLeft: 8,
    flex: 1,
    flexDirection: "column",
    textAlignVertical: "center",
    justifyContent: "flex-start",
  },
  stats: {
    paddingTop: 1,
    fontSize: 11,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
