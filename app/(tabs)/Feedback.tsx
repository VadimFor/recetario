// app/Feedback.tsx
import { ArrowUp, Edit, Plus, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Post {
  id: number;
  title: string;
  description: string;
  votes: number;
}

const samplePosts: Post[] = [
  {
    id: 1,
    title: "Dark Mode",
    description: "Add an option for dark mode UI.",
    votes: 12,
  },
  {
    id: 2,
    title: "Offline Recipes",
    description: "Allow saving recipes to use offline.",
    votes: 20,
  },
  {
    id: 3,
    title: "More Categories",
    description: "Include vegan, keto, and gluten-free filters.",
    votes: 8,
  },
  {
    id: 4,
    title: "Weekly Meal Planner",
    description:
      "Let users plan recipes for the week and generate a shopping list.",
    votes: 15,
  },
  {
    id: 5,
    title: "Ingredient Substitutions",
    description: "Suggest alternatives if an ingredient is unavailable.",
    votes: 6,
  },
  {
    id: 6,
    title: "Voice Search",
    description: "Allow searching recipes by voice commands.",
    votes: 10,
  },
  {
    id: 7,
    title: "Rating System",
    description: "Add stars or thumbs-up ratings to recipes.",
    votes: 18,
  },
  {
    id: 8,
    title: "Comments Section",
    description: "Let users leave tips or reviews under recipes.",
    votes: 25,
  },
  {
    id: 9,
    title: "Push Notifications",
    description: "Notify when new trending recipes are published.",
    votes: 4,
  },
  {
    id: 10,
    title: "International Recipes",
    description: "Expand with cuisines from around the world.",
    votes: 14,
  },
];
const Feedback = () => {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const addOrUpdatePost = () => {
    if (!title.trim()) return;

    if (editingId) {
      // Update existing post
      setPosts((prev) =>
        prev.map((post) =>
          post.id === editingId ? { ...post, title, description } : post
        )
      );
      setEditingId(null);
    } else {
      // Add new post
      const newPost: Post = {
        id: Date.now(),
        title,
        description,
        votes: 0,
      };
      setPosts((prev) => [newPost, ...prev].sort((a, b) => b.votes - a.votes));
    }

    setTitle("");
    setDescription("");
    setShowForm(false);
  };

  const upvotePost = (id: number) => {
    setPosts((prev) =>
      [...prev]
        .map((post) =>
          post.id === id ? { ...post, votes: post.votes + 1 } : post
        )
        .sort((a, b) => b.votes - a.votes)
    );
  };

  const editPost = (id: number) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    setTitle(post.title);
    setDescription(post.description);
    setEditingId(post.id);
    setShowForm(true);
  };

  const deletePost = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* 🔹 Header */}
      <View className="bg-purple-600 pt-10 px-5 pb-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-3xl font-bold">Feedback</Text>
            <Text className="text-white text-base">
              Suggest features and vote ideas
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setTitle("");
              setDescription("");
            }}
            className="bg-white p-2 rounded-full shadow"
          >
            <Plus size={24} color="purple" />
          </TouchableOpacity>
        </View>
      </View>

      {/* New Post / Edit Form */}
      {showForm && (
        <View className="bg-white p-4 rounded-lg m-4 shadow">
          <TextInput
            placeholder="Feature title"
            value={title}
            onChangeText={setTitle}
            className="border-b border-gray-300 mb-2 p-2"
          />
          <TextInput
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            className="border-b border-gray-300 mb-2 p-2"
          />
          <TouchableOpacity
            onPress={addOrUpdatePost}
            className="bg-purple-600 py-2 px-4 rounded-lg mt-2"
          >
            <Text className="text-white text-center font-bold">
              {editingId ? "Update Post" : "Add Post"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-lg mb-3 shadow">
            {/* Title + description */}
            <View className="flex-row justify-between">
              <View className="flex-1 pr-2">
                <Text className="text-lg font-bold">{item.title}</Text>
                {item.description ? (
                  <Text className="text-gray-600">{item.description}</Text>
                ) : null}
              </View>
              {/* Voting */}
              <TouchableOpacity
                onPress={() => upvotePost(item.id)}
                className="items-center ml-2"
              >
                <ArrowUp size={24} color="purple" />
                <Text className="font-bold">{item.votes}</Text>
              </TouchableOpacity>
            </View>

            {/* Edit & Delete Buttons */}
            <View className="flex-row mt-3 space-x-4">
              <TouchableOpacity
                onPress={() => editPost(item.id)}
                className="flex-row items-center bg-yellow-400 px-3 py-1 rounded-full"
              >
                <Edit size={16} color="white" />
                <Text className="text-white ml-1 font-bold">Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => deletePost(item.id)}
                className="flex-row items-center bg-red-500 px-3 py-1 rounded-full"
              >
                <Trash2 size={16} color="white" />
                <Text className="text-white ml-1 font-bold">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default Feedback;
