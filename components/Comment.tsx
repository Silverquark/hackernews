import React from "react";
import {
  TouchableHighlight,
  View,
  StyleSheet,
  Text,
  useWindowDimensions,
} from "react-native";
import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";
import * as WebBrowser from "expo-web-browser";
import axios from "axios";
import { useQuery } from "react-query";

import { WebView } from "react-native-webview";
import { decode } from "html-entities";

import RenderHtml from "react-native-render-html";
import { FlatList } from "react-native-gesture-handler";

interface CommentProps {
  commentID: number;
  even: boolean;
}

interface Comment {
  by: string;
  descendants: number;
  id: number;
  kids: number[];
  time: number;
  text: string;
  type: "comment";
}

async function getComment(commentID: number) {
  try {
    const response = await axios.get<Comment>(
      `https://hacker-news.firebaseio.com/v0/item/${commentID}.json`
    );
    if (response.status !== 200) {
      throw new Error("Problem fetching data");
    }
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

const Comment = ({ commentID, even }: CommentProps) => {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();

  const { isLoading, isError, data, error } = useQuery<Comment | undefined>(
    ["comment", commentID],
    () => getComment(commentID)
  );

  return (
    <View
      key={commentID}
      style={{
        width: "100%",
        flexDirection: "row",
        backgroundColor: even
          ? Colors[colorScheme].background
          : Colors[colorScheme].backgroundLight,
      }}
    >
      {/* <TouchableHighlight
        style={styles.container}
        underlayColor={Colors[colorScheme].tint}
        onPress={() => {}}
      > */}
      <>
        {isLoading && <Text>Loading...</Text>}
        {isError && <Text>{`Error: ${error}`}</Text>}
        {!isLoading && !isError && (
          <RenderHtml
            contentWidth={width}
            source={{
              html: data?.text ?? "-",
            }}
            baseStyle={{
              color: Colors[colorScheme].text,
              fontSize: 16,
              lineHeight: 20,
              padding: 8,
              backgroundColor: "transparent",
              overflow: "hidden",
              textAlign: "left",
              textAlignVertical: "top",
              textDecorationLine: "none",
              textDecorationStyle: "solid",
              textDecorationColor: Colors[colorScheme].text,
              textTransform: "none",
            }}
            classesStyles={{
              body: {
                color: "#f00",
                backgroundColor: Colors[colorScheme].background,
              },
              p: {
                fontSize: 16,
                lineHeight: 24,
                color: Colors[colorScheme].text,
              },
              a: {
                color: Colors[colorScheme].tint,
                textDecorationLine: "underline",
              },
            }}
          />
        )}
      </>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
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
    fontSize: 12,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});

export default Comment;
