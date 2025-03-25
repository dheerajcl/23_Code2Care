import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createEvent, updateEvent } from '@/services/database.service';
import { Event } from '@/lib/supabase';
import { TimePicker } from '@/components/ui/time-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type EventFormProps = {
  initialData?: Event;
  isEditing?: boolean;
};

const eventCategories = ['Education', 'Blog', 'Rehabilitation', 'Culture', 'Sports', 'Environment', 'Audio Recording', 'Field Work', 'Other'];

const AdminEventForm = ({ initialData, isEditing = false }: EventFormProps) => {
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.start_date ? new Date(initialData.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.end_date ? new Date(initialData.end_date) : undefined
  );
  const [startTime, setStartTime] = useState<string>(
    initialData?.start_date ? format(new Date(initialData.start_date), 'HH:mm') : '09:00'
  );
  const [endTime, setEndTime] = useState<string>(
    initialData?.end_date ? format(new Date(initialData.end_date), 'HH:mm') : '17:00'
  );

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      category: initialData?.category || 'Education',
      status: 'scheduled',
      capacity: initialData?.max_volunteers || 20,
      start_date: initialData?.start_date || '',
      end_date: initialData?.end_date || '',
      image_url: initialData?.image_url || null,
      image_file: null
    }
  });

  // Set date values in form when they change
  useEffect(() => {
    if (startDate) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const date = new Date(startDate);
      date.setHours(hours, minutes, 0, 0);
      setValue('start_date', date.toISOString());
    }
  }, [startDate, startTime, setValue]);

  useEffect(() => {
    if (endDate) {
      const [hours, minutes] = endTime.split(':').map(Number);
      const date = new Date(endDate);
      date.setHours(hours, minutes, 0, 0);
      setValue('end_date', date.toISOString());
    }
  }, [endDate, endTime, setValue]);

  // Handle file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('image_file', file);
      // Create a preview URL
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  // Clear image preview and file input
  const handleClearImage = () => {
    setImagePreview(null);
    setValue('image_file', null);
    setValue('image_url', null);
  };

  const onSubmit = async (data: any) => {
    // Validate dates
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    // Create full datetime objects
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const endDateTime = new Date(endDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    // Validate that end date is after start date
    if (endDateTime <= startDateTime) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare event data
      const eventData = {
        title: data.title,
        description: data.description,
        location: data.location,
        category: data.category, // Now using category field
        status: 'scheduled', // Set status as scheduled
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        image_url: initialData?.image_url || null,
        image_file: data.image_file,
        max_volunteers: parseInt(data.capacity)
      };

      let result;
      if (isEditing && initialData?.id) {
        // Update existing event
        result = await updateEvent(initialData.id, eventData);
      } else {
        // Create new event
        result = await createEvent(eventData as Event);
      }

      if (result.error) {
        throw new Error(result.error.message || 'Error saving event');
      }

      toast({
        title: isEditing ? "Event Updated" : "Event Created",
        description: `${data.title} has been ${isEditing ? 'updated' : 'created'} successfully.`
      });

      // Navigate back to events list
      navigate('/admin/events');
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to save event. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Event Title <span className="text-red-500">*</span></Label>
          <Input 
            id="title" 
            {...register('title', { required: 'Title is required' })} 
            placeholder="Enter event title" 
            className="mt-1"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
          <Textarea 
            id="description" 
            {...register('description', { required: 'Description is required' })} 
            placeholder="Describe the event details, objectives, and what volunteers should expect" 
            className="mt-1 min-h-32"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
            <Select 
              onValueChange={(value) => setValue('category', value)} 
              defaultValue={initialData?.category || 'Education'}
            >
              <SelectTrigger id="category" className="mt-1">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {eventCategories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="capacity">Volunteer Capacity <span className="text-red-500">*</span></Label>
            <Input 
              id="capacity" 
              type="number" 
              min="1" 
              {...register('capacity', { 
                required: 'Capacity is required',
                min: { value: 1, message: 'Capacity must be at least 1' } 
              })} 
              placeholder="Maximum number of volunteers" 
              className="mt-1"
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
          <Input 
            id="location" 
            {...register('location', { required: 'Location is required' })} 
            placeholder="Enter the event location or venue" 
            className="mt-1"
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
          )}
        </div>

        <div className="space-y-2">
            <Label>Set Registration Deadline<span className="text-red-500">*</span></Label>
            <div className="flex flex-col space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center space-x-2">
                <TimePicker setTime={setStartTime} time={startTime} />
              </div>
            </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date and Time<span className="text-red-500">*</span></Label>
            <div className="flex flex-col space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center space-x-2">
                <TimePicker setTime={setStartTime} time={startTime} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>End Date and Time<span className="text-red-500">*</span></Label>
            <div className="flex flex-col space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => {
                      const today = new Date(new Date().setHours(0, 0, 0, 0));
                      return date < today || (startDate && date < startDate);
                    }}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center space-x-2">
                <TimePicker setTime={setEndTime} time={endTime} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="image">Event Image</Label>
          <div className="mt-1 space-y-2">
            <Input 
              id="image" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground">
              Recommended: Square image of at least 500x500px
            </p>
            
            {imagePreview && (
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Event preview" 
                  className="mt-2 max-w-xs h-auto rounded-md"
                />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/admin/events')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};

export default AdminEventForm;