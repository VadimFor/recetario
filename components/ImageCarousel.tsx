import { Ionicons } from "@expo/vector-icons"; // Icon library for arrows
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  TouchableOpacity,
  View,
} from "react-native";

// Get device screen width
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Overlap between carousel items (slightly negative margin to create overlay effect)
const CAROUSEL_ITEM_OVERLAP = SCREEN_WIDTH * 0.03;

// Width of each carousel item (main image container)
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH * 0.8;

// Padding to center first and last item
const CAROUSEL_CONTENT_PADDING = (SCREEN_WIDTH - CAROUSEL_ITEM_WIDTH) / 2;

const ImageCarousel = ({ data }: { data: string[] }) => {
  // Animated value to track horizontal scroll position
  const scrollX = useRef(new Animated.Value(0)).current;

  // Reference to FlatList to control scrolling programmatically
  const flatListRef = useRef<Animated.FlatList>(null);

  // Track currently centered item index
  const [currentCenterIndex, setCurrentCenterIndex] = useState(0);

  // Listener for FlatList scrolling to update currentCenterIndex
  const handleScroll = (event: any) => {
    const newIndex = Math.round(
      event.nativeEvent.contentOffset.x / CAROUSEL_ITEM_WIDTH
    );
    setCurrentCenterIndex(newIndex);
  };

  // Programmatically scroll to a specific index (used by arrow buttons)
  const scrollToItem = (index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * CAROUSEL_ITEM_WIDTH,
      animated: true,
    });
  };

  return (
    <View>
      {/* Carousel FlatList */}
      <Animated.FlatList
        ref={flatListRef} // Assign ref to control scroll programmatically
        data={data} // Array of image URLs
        horizontal // Horizontal scrolling
        showsHorizontalScrollIndicator={false} // Hide scroll bar
        snapToInterval={CAROUSEL_ITEM_WIDTH} // Snap to each item
        decelerationRate="fast" // Faster deceleration for snap effect
        bounces={false} // Disable bouncing
        initialScrollIndex={0} // Start from second image
        getItemLayout={(_, index) => ({
          length: CAROUSEL_ITEM_WIDTH, // Each item's width
          offset: CAROUSEL_ITEM_WIDTH * index, // Position of item
          index,
        })}
        contentContainerStyle={{ paddingHorizontal: CAROUSEL_CONTENT_PADDING }} // Padding to center first/last item
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }], // Map scrollX animated value
          { useNativeDriver: true, listener: handleScroll } // Update currentCenterIndex
        )}
        scrollEventThrottle={16} // Limit scroll events to 60fps
        keyExtractor={(_, index) => index.toString()} // Unique key for each item
        // Render each carousel image item
        renderItem={({ item: imageUrl, index }) => {
          // Input range for interpolation (previous, current, next item)
          const inputRange = [
            (index - 1) * CAROUSEL_ITEM_WIDTH,
            index * CAROUSEL_ITEM_WIDTH,
            (index + 1) * CAROUSEL_ITEM_WIDTH,
          ];

          // Scale interpolation: center image is bigger
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.75, 1.1, 0.75],
            extrapolate: "clamp",
          });

          // Opacity interpolation: center image is fully opaque
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: "clamp",
          });

          // Z-index interpolation: center image appears on top
          const zIndex = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: "clamp",
          });

          return (
            <View style={{ width: CAROUSEL_ITEM_WIDTH }}>
              <Animated.View
                className="rounded-2xl overflow-hidden shadow-lg"
                style={{
                  marginHorizontal: -CAROUSEL_ITEM_OVERLAP, // Overlap effect
                  transform: [{ scale }], // Scale center image
                  opacity, // Fade side images
                  zIndex, // Bring center image to front
                  elevation: zIndex, // Android shadow stacking
                }}
              >
                <Image
                  source={
                    typeof imageUrl === "string" ? { uri: imageUrl } : imageUrl
                  } // Image URL
                  className="w-full" // Fill container width
                  resizeMode="cover" // Cover entire container
                  style={{ height: SCREEN_WIDTH * 0.7 }} // Height 70% of screen width
                />
              </Animated.View>
            </View>
          );
        }}
      />

      {/* Left Arrow (only visible if not at first item) */}
      {currentCenterIndex > 0 && (
        <TouchableOpacity
          onPress={() => scrollToItem(currentCenterIndex - 1)} // Scroll to previous item
          style={{
            position: "absolute",
            left: 10, // Position on left side
            top: "45%", // Vertically center
            backgroundColor: "rgba(0,0,0,0.3)", // Semi-transparent background
            padding: 10,
            borderRadius: 30, // Circular button
          }}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Right Arrow (only visible if not at last item) */}
      {currentCenterIndex < data.length - 1 && (
        <TouchableOpacity
          onPress={() => scrollToItem(currentCenterIndex + 1)} // Scroll to next item
          style={{
            position: "absolute",
            right: 10, // Position on right side
            top: "45%", // Vertically center
            backgroundColor: "rgba(0,0,0,0.3)", // Semi-transparent background
            padding: 10,
            borderRadius: 30, // Circular button
          }}
        >
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ImageCarousel;
