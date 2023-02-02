import React from "react";
import {
  StyleSheet,
  VirtualizedList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Comment from "../components/Comment";

import useColorScheme from "../hooks/useColorScheme";
import { CommentsScreenProps } from "../types";

export default function CommentScreen(props: CommentsScreenProps) {
  const commentIDs = props?.route.params?.commentIDs;
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  return (
    <VirtualizedList
      data={commentIDs}
      initialNumToRender={10}
      keyExtractor={(item) => (item as number).toString()}
      renderItem={({ item, index }) => (
        <Comment commentID={item as number} even={Boolean(index % 2)} />
      )}
      getItemCount={() => commentIDs?.length ?? 0}
      getItem={(data, index) => data[index]}
    />
  );
}

const styles = StyleSheet.create({});
