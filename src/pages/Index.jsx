// Complete the Index page component here
// Use chakra-ui and react-icons for UI components
import { useState, useEffect } from "react";
import { Box, Heading, VStack, Text, Button, Link, IconButton, useToast } from "@chakra-ui/react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { client } from "lib/crud";

const Index = () => {
  const [stories, setStories] = useState([]);
  const [favorites, setFavorites] = useState({});
  const toast = useToast();

  useEffect(() => {
    fetch("https://hn.algolia.com/api/v1/search?query=LLMs")
      .then((response) => response.json())
      .then((data) => {
        setStories(data.hits);
      })
      .catch((error) => {
        console.error("Error fetching stories:", error);
      });

    client.getWithPrefix("favorite:").then((data) => {
      if (data) {
        const favs = data.reduce((acc, item) => {
          acc[item.key.split(":")[1]] = true;
          return acc;
        }, {});
        setFavorites(favs);
      }
    });
  }, []);

  const handleFavorite = (story) => {
    const key = `favorite:${story.objectID}`;
    const isFav = favorites[story.objectID];

    if (isFav) {
      client.delete(key).then((success) => {
        if (success) {
          setFavorites((prev) => {
            const updated = { ...prev };
            delete updated[story.objectID];
            return updated;
          });
          toast({
            title: "Removed from favorites.",
            status: "info",
            duration: 2000,
            isClosable: true,
          });
        }
      });
    } else {
      client.set(key, story).then((success) => {
        if (success) {
          setFavorites((prev) => ({ ...prev, [story.objectID]: true }));
          toast({
            title: "Added to favorites!",
            status: "success",
            duration: 2000,
            isClosable: true,
          });
        }
      });
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h1" size="xl" textAlign="center">
        LLM Stories
      </Heading>
      {stories.map((story) => (
        <Box key={story.objectID} p={5} shadow="md" borderWidth="1px">
          <Heading fontSize="xl">{story.title}</Heading>
          <Text mt={4}>{story.story_text || "No additional text available."}</Text>
          <Link href={story.url} isExternal color="teal.500">
            Read more
          </Link>
          <IconButton aria-label={favorites[story.objectID] ? "Remove from favorites" : "Add to favorites"} icon={favorites[story.objectID] ? <FaHeart /> : <FaRegHeart />} onClick={() => handleFavorite(story)} colorScheme={favorites[story.objectID] ? "red" : "gray"} variant="outline" ml={2} />
        </Box>
      ))}
    </VStack>
  );
};

export default Index;
