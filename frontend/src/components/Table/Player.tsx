import React from 'react'

export interface Player
{
  width: number;
  height: number;
  x: number;
  y: number;
  color: string;
  reverseColor: string;
  score: number;
  ai: number;
  aiStep: number;
}
