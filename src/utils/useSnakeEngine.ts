import { useCallback, useEffect, useRef, useState } from 'react';
import { Coordinate, Direction } from '../types';
import {
  areCoordinatesEqual,
  checkCollision,
  generateRandomFood,
  getNextHeadCoordinate,
  GRID_SIZE,
  INITIAL_DIRECTION,
  INITIAL_SNAKE,
  INITIAL_SPEED_MS,
  isOppositeDirection,
  MIN_SPEED_MS,
  SPEED_DECREMENT_MS,
} from './gameLogic';
import { useStore } from '../store/useStore';

export interface SnakeEngineResult {
  snake: Coordinate[];
  food: Coordinate;
  direction: Direction;
  score: number;
  highScore: number;
  isGameOver: boolean;
  isPaused: boolean;
  gridSize: number;
  changeDirection: (nextDirection: Direction) => void;
  restartGame: () => void;
  togglePause: () => void;
}

export const useSnakeEngine = (): SnakeEngineResult => {
  const snakeHighScore = useStore((state) => state.snakeHighScore);
  const setSnakeHighScore = useStore((state) => state.setSnakeHighScore);

  const [snake, setSnake] = useState<Coordinate[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Coordinate>(() => generateRandomFood(INITIAL_SNAKE, GRID_SIZE));
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const directionRef = useRef<Direction>(INITIAL_DIRECTION);
  const nextDirectionQueueRef = useRef<Direction>(INITIAL_DIRECTION);
  const foodRef = useRef<Coordinate>(food);
  const scoreRef = useRef<number>(0);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    scoreRef.current = score;
    if (score > snakeHighScore) {
      setSnakeHighScore(score);
    }
  }, [score, snakeHighScore, setSnakeHighScore]);

  const changeDirection = useCallback((requested: Direction): void => {
    const currentEffective = directionRef.current;
    if (!isOppositeDirection(currentEffective, requested) && currentEffective !== requested) {
      nextDirectionQueueRef.current = requested;
      setDirection(requested);
    }
  }, []);

  const restartGame = useCallback((): void => {
    const initialFood = generateRandomFood(INITIAL_SNAKE, GRID_SIZE);
    directionRef.current = INITIAL_DIRECTION;
    nextDirectionQueueRef.current = INITIAL_DIRECTION;
    foodRef.current = initialFood;
    scoreRef.current = 0;

    setSnake(INITIAL_SNAKE);
    setFood(initialFood);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
  }, []);

  const togglePause = useCallback((): void => {
    setIsPaused((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isGameOver || isPaused) {
      return;
    }

    const currentSpeed = Math.max(
      MIN_SPEED_MS,
      INITIAL_SPEED_MS - Math.floor(score / 10) * SPEED_DECREMENT_MS
    );

    const intervalId = setInterval(() => {
      setSnake((prevSnake) => {
        const activeDir = nextDirectionQueueRef.current;
        directionRef.current = activeDir;

        const currentHead = prevSnake[0];
        const nextHead = getNextHeadCoordinate(currentHead, activeDir);

        if (checkCollision(nextHead, prevSnake, GRID_SIZE)) {
          setIsGameOver(true);
          return prevSnake;
        }

        const isEating = areCoordinatesEqual(nextHead, foodRef.current);
        if (isEating) {
          const grownSnake: Coordinate[] = [nextHead, ...prevSnake];
          const nextFood = generateRandomFood(grownSnake, GRID_SIZE);
          foodRef.current = nextFood;
          setFood(nextFood);
          setScore((prevScore) => prevScore + 10);
          return grownSnake;
        }

        return [nextHead, ...prevSnake.slice(0, -1)];
      });
    }, currentSpeed);

    return () => {
      clearInterval(intervalId);
    };
  }, [isGameOver, isPaused, score]);

  return {
    snake,
    food,
    direction,
    score,
    highScore: Math.max(snakeHighScore, score),
    isGameOver,
    isPaused,
    gridSize: GRID_SIZE,
    changeDirection,
    restartGame,
    togglePause,
  };
};

export default useSnakeEngine;

