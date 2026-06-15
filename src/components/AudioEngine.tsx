import React, { useEffect, useRef } from "react";
import { Howl } from "howler";

interface AudioEngineProps {
  condition: "sunny" | "rainy" | "stormy";
}

export const AudioEngine: React.FC<AudioEngineProps> = ({ condition }) => {
  const sunnyHowl = useRef<Howl | null>(null);
  const rainyHowl = useRef<Howl | null>(null);
  const stormyHowl = useRef<Howl | null>(null);

  useEffect(() => {
    // Note: In AI Studio, we don't have local assets, using placeholders
    // Using some known quiet environmental audio placeholders
    sunnyHowl.current = new Howl({
      src: ["https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"], // Forest birds
      loop: true,
      volume: 0,
    });

    rainyHowl.current = new Howl({
      src: ["https://assets.mixkit.co/active_storage/sfx/2471/2471-preview.mp3"], // Rain
      loop: true,
      volume: 0,
    });

    stormyHowl.current = new Howl({
      src: ["https://assets.mixkit.co/active_storage/sfx/2474/2474-preview.mp3"], // Heavy rain + Thunder
      loop: true,
      volume: 0,
    });

    sunnyHowl.current.play();
    rainyHowl.current.play();
    stormyHowl.current.play();

    return () => {
      sunnyHowl.current?.stop();
      rainyHowl.current?.stop();
      stormyHowl.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (condition === "sunny") {
      sunnyHowl.current?.fade(sunnyHowl.current.volume(), 0.5, 2000);
      rainyHowl.current?.fade(rainyHowl.current.volume(), 0, 2000);
      stormyHowl.current?.fade(stormyHowl.current.volume(), 0, 2000);
    } else if (condition === "rainy") {
      sunnyHowl.current?.fade(sunnyHowl.current.volume(), 0.1, 2000);
      rainyHowl.current?.fade(rainyHowl.current.volume(), 0.6, 2000);
      stormyHowl.current?.fade(stormyHowl.current.volume(), 0.1, 2000);
    } else if (condition === "stormy") {
      sunnyHowl.current?.fade(sunnyHowl.current.volume(), 0, 2000);
      rainyHowl.current?.fade(rainyHowl.current.volume(), 0.3, 2000);
      stormyHowl.current?.fade(stormyHowl.current.volume(), 0.8, 2000);
    }
  }, [condition]);

  return null;
};
