import { Coordinate, Direction } from '../types';

export const GRID_SIZE = 18;
export const INITIAL_SPEED_MS = 140;
export const MIN_SPEED_MS = 65;
export const SPEED_DECREMENT_MS = 4;

export const INITIAL_SNAKE: Coordinate[] = [
  { x: 8, y: 9 },
  { x: 7, y: 9 },
  { x: 6, y: 9 },
];

export const INITIAL_DIRECTION: Direction = 'RIGHT';

export const isOppositeDirection = (current: Direction, next: Direction): boolean => {
  if (current === 'UP' && next === 'DOWN') return true;
  if (current === 'DOWN' && next === 'UP') return true;
  if (current === 'LEFT' && next === 'RIGHT') return true;
  if (current === 'RIGHT' && next === 'LEFT') return true;
  return false;
};

export const areCoordinatesEqual = (a: Coordinate, b: Coordinate): boolean => {
  return a.x === b.x && a.y === b.y;
};

export const isCoordinateOnSnake = (coord: Coordinate, snake: readonly Coordinate[]): boolean => {
  return snake.some((segment) => areCoordinatesEqual(segment, coord));
};

export const getNextHeadCoordinate = (head: Coordinate, direction: Direction): Coordinate => {
  switch (direction) {
    case 'UP':
      return { x: head.x, y: head.y - 1 };
    case 'DOWN':
      return { x: head.x, y: head.y + 1 };
    case 'LEFT':
      return { x: head.x - 1, y: head.y };
    case 'RIGHT':
      return { x: head.x + 1, y: head.y };
  }
};

export const isOutOfBounds = (coord: Coordinate, gridSize: number = GRID_SIZE): boolean => {
  return coord.x < 0 || coord.x >= gridSize || coord.y < 0 || coord.y >= gridSize;
};

export const checkCollision = (
  nextHead: Coordinate,
  snakeBody: readonly Coordinate[],
  gridSize: number = GRID_SIZE
): boolean => {
  if (isOutOfBounds(nextHead, gridSize)) {
    return true;
  }
  // Check against all segments except the tail tip which moves forward unless eating
  const bodyWithoutTail = snakeBody.slice(0, -1);
  return isCoordinateOnSnake(nextHead, bodyWithoutTail);
};

export const generateRandomFood = (
  snake: readonly Coordinate[],
  gridSize: number = GRID_SIZE
): Coordinate => {
  const availableCells: Coordinate[] = [];
  for (let x = 0; x < gridSize; x += 1) {
    for (let y = 0; y < gridSize; y += 1) {
      const candidate: Coordinate = { x, y };
      if (!isCoordinateOnSnake(candidate, snake)) {
        availableCells.push(candidate);
      }
    }
  }

  if (availableCells.length === 0) {
    return { x: 0, y: 0 };
  }

  const randomIndex = Math.floor(Math.random() * availableCells.length);
  return availableCells[randomIndex];
};


