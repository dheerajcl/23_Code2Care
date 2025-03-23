import React from 'react';
import { Input } from './input';

interface TimePickerProps {
  time: string;
  setTime: (time: string) => void;
}

export function TimePicker({ time, setTime }: TimePickerProps) {
  const [hours, minutes] = time.split(':').map(Number);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTime(value);
  };

  return (
    <Input
      type="time"
      value={time}
      onChange={handleTimeChange}
      className="w-full"
    />
  );
} 