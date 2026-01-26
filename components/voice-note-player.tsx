/**
 * Voice Note Player Component
 * 
 * Provides playback controls for voice recordings
 */

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";

interface VoiceNotePlayerProps {
  uri: string;
  duration?: number;
}

export function VoiceNotePlayer({ uri, duration }: VoiceNotePlayerProps) {
  const player = useAudioPlayer(uri);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Update duration when player is ready
    if (player.duration && !totalDuration) {
      setTotalDuration(player.duration);
    }

    // Update current time during playback
    const interval = setInterval(() => {
      if (player.playing) {
        setCurrentTime(player.currentTime);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      player.release();
    };
  }, [player]);

  useEffect(() => {
    // Sync playing state with player
    setIsPlaying(player.playing);
    
    // Reset when playback ends
    if (player.currentTime >= player.duration && player.duration > 0) {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [player.playing, player.currentTime, player.duration]);

  const handlePlayPause = async () => {
    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        // If at the end, restart from beginning
        if (currentTime >= totalDuration - 0.1) {
          player.seekTo(0);
          setCurrentTime(0);
        }
        player.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Playback error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplay = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      player.seekTo(0);
      setCurrentTime(0);
      player.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Replay error:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <View className="bg-surface rounded-xl p-4 border border-border gap-3">
      {/* Progress Bar */}
      <View className="gap-1">
        <View className="bg-border rounded-full h-2">
          <View
            className="bg-primary rounded-full h-2"
            style={{ width: `${progress}%` }}
          />
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">{formatTime(currentTime)}</Text>
          <Text className="text-xs text-muted">{formatTime(totalDuration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row items-center gap-3">
        {/* Play/Pause Button */}
        <TouchableOpacity
          onPress={handlePlayPause}
          disabled={loading}
          className="bg-primary rounded-full w-12 h-12 items-center justify-center"
          style={{ opacity: loading ? 0.5 : 1 }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-xl">{isPlaying ? "⏸" : "▶️"}</Text>
          )}
        </TouchableOpacity>

        {/* Replay Button */}
        <TouchableOpacity
          onPress={handleReplay}
          disabled={loading}
          className="bg-surface border border-border rounded-full w-10 h-10 items-center justify-center"
          style={{ opacity: loading ? 0.5 : 1 }}
        >
          <Text className="text-base">↻</Text>
        </TouchableOpacity>

        {/* Duration Info */}
        <View className="flex-1">
          <Text className="text-xs text-muted">
            {isPlaying ? "Playing..." : "Tap to play"}
          </Text>
        </View>
      </View>
    </View>
  );
}
