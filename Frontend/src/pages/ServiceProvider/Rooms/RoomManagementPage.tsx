// src/pages/ServiceProvider/Rooms/RoomManagementPage.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import { Input } from '@/components/ui/admin/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/admin/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/admin/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/admin/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/admin/dialog';
import { Label } from '@/components/ui/admin/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/admin/select';
import { Calendar } from '@/components/ui/admin/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/admin/popover';
import {
  Filter,
  Plus,
  Eye,
  Edit,
  Wifi,
  Tv,
  Coffee,
  Bath,
  CalendarIcon,
  Search,
  MoreHorizontal,
} from 'lucide-react';
import { format } from 'date-fns';

interface Room {
  id: string;
  number: string;
  type: string;
  status: 'occupied' | 'available' | 'maintenance';
  guest?: string;
  rate: string;
  checkIn?: string;
  checkOut?: string;
  amenities: string[];
}

interface Booking {
  id: string;
  guest: string;
  room: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  source: string;
}

// Room Card Component
function RoomCard({ room }: { room: Room }) {
  const statusConfig = {
    occupied: { 
      color: 'bg-red-500', 
      badge: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      label: 'Occupied'
    },
    available: { 
      color: 'bg-green-500', 
      badge: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      label: 'Available'
    },
    maintenance: { 
      color: 'bg-yellow-500', 
      badge: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      label: 'Maintenance'
    },
  };

  const config = statusConfig[room.status];

  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'TV': Tv,
    'Coffee': Coffee,
    'Bath': Bath,
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-sidebar-border bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${config.color} shadow-sm`} />
            <div>
              <h3 className="font-semibold text-lg text-foreground">Room {room.number}</h3>
              <Badge variant="outline" className="mt-1.5 border-sidebar-border">{room.type}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Status</p>
            <Badge className={`${config.badge} font-medium`}>{config.label}</Badge>
          </div>

          {room.guest && (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Guest</p>
              <p className="font-medium text-foreground">{room.guest}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Rate</p>
            <p className="font-bold text-xl text-primary">{room.rate}</p>
          </div>

          {room.checkIn && room.checkOut && (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Stay Period</p>
              <p className="text-sm text-foreground">{room.checkIn} to {room.checkOut}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {room.amenities.map((amenity) => {
              const Icon = amenityIcons[amenity];
              return Icon ? (
                <div 
                  key={amenity} 
                  className="p-2.5 bg-sidebar-accent rounded-lg hover:bg-sidebar-accent/80 transition-colors" 
                  title={amenity}
                >
                  <Icon className="w-4 h-4 text-sidebar-accent-foreground" />
                </div>
              ) : null;
            })}
          </div>
        </div>

        <div className="flex gap-2 mt-5 pt-4 border-t border-sidebar-border">
          <Button variant="outline" size="sm" className="flex-1 hover:bg-sidebar-accent border-sidebar-border">
            <Eye className="w-4 h-4 mr-1.5" />
            View
          </Button>
          <Button variant="default" size="sm" className="flex-1 ">
            <Edit className="w-4 h-4 mr-1.5" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// New Booking Dialog Component
function NewBookingDialog() {
  const [date, setDate] = useState<Date>();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-popover border-sidebar-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Booking</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new booking for a room. Fill in all required information.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="guest-name" className="text-foreground">Guest Name</Label>
            <Input id="guest-name" placeholder="John Doe" className="bg-input border-border" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="room" className="text-foreground">Room</Label>
            <Select>
              <SelectTrigger id="room" className="bg-input border-border">
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-sidebar-border">
                <SelectItem value="101">Room 101 - Standard</SelectItem>
                <SelectItem value="102">Room 102 - Standard</SelectItem>
                <SelectItem value="103">Room 103 - Deluxe</SelectItem>
                <SelectItem value="201">Room 201 - Suite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-foreground">Check-in</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start border-border">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-sidebar-border">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label className="text-foreground">Check-out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start border-border">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Pick date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-sidebar-border">
                  <Calendar mode="single" />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="guests" className="text-foreground">Number of Guests</Label>
            <Input id="guests" type="number" placeholder="2" className="bg-input border-border" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Create Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Room Management Page
export default function RoomManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const rooms: Room[] = [
    {
      id: '1',
      number: '101',
      type: 'Standard',
      status: 'occupied',
      guest: 'John Smith',
      rate: '$120/night',
      checkIn: '2024-01-15',
      checkOut: '2024-01-18',
      amenities: ['WiFi', 'TV', 'Coffee'],
    },
    {
      id: '2',
      number: '102',
      type: 'Standard',
      status: 'available',
      rate: '$120/night',
      amenities: ['WiFi', 'TV', 'Coffee'],
    },
    {
      id: '3',
      number: '103',
      type: 'Deluxe',
      status: 'maintenance',
      rate: '$180/night',
      amenities: ['WiFi', 'TV', 'Coffee', 'Bath'],
    },
    {
      id: '4',
      number: '201',
      type: 'Suite',
      status: 'occupied',
      guest: 'Sarah Wilson',
      rate: '$300/night',
      checkIn: '2024-01-14',
      checkOut: '2024-01-20',
      amenities: ['WiFi', 'TV', 'Coffee', 'Bath'],
    },
    {
      id: '5',
      number: '202',
      type: 'Suite',
      status: 'available',
      rate: '$300/night',
      amenities: ['WiFi', 'TV', 'Coffee', 'Bath'],
    },
  ];

  const bookings: Booking[] = [
    {
      id: 'BK001',
      guest: 'Michael Johnson',
      room: '301',
      checkIn: '2024-01-20',
      checkOut: '2024-01-23',
      guests: 2,
      amount: '$540',
      status: 'confirmed',
      source: 'Direct',
    },
    {
      id: 'BK002',
      guest: 'Emma Davis',
      room: '205',
      checkIn: '2024-01-22',
      checkOut: '2024-01-25',
      guests: 1,
      amount: '$360',
      status: 'pending',
      source: 'Booking.com',
    },
    {
      id: 'BK003',
      guest: 'Robert Brown',
      room: '104',
      checkIn: '2024-01-25',
      checkOut: '2024-01-28',
      guests: 3,
      amount: '$432',
      status: 'confirmed',
      source: 'Expedia',
    },
  ];

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Room Management</h1>
            <p className="text-muted-foreground mt-1.5">
              Manage rooms, bookings, and availability
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-sidebar-border hover:bg-sidebar-accent">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <NewBookingDialog />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="room-status" className="w-full">
        <TabsList className="bg-muted border border-sidebar-border">
          <TabsTrigger value="room-status" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
            Room Status
          </TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
            Bookings
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Room Status Tab */}
        <TabsContent value="room-status" className="space-y-4 mt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto border-border">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "26/08/2025"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-sidebar-border">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4 mt-6">
          <Card className="shadow-sm border-sidebar-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Recent Bookings</h3>
                <p className="text-sm text-muted-foreground mt-1">View and manage all bookings</p>
              </div>
              <Button variant="outline" size="sm" className="border-sidebar-border hover:bg-sidebar-accent">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-sidebar-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-sidebar-border">
                      <TableHead className="font-semibold text-foreground">Booking ID</TableHead>
                      <TableHead className="font-semibold text-foreground">Guest</TableHead>
                      <TableHead className="font-semibold text-foreground">Room</TableHead>
                      <TableHead className="font-semibold text-foreground">Check-in</TableHead>
                      <TableHead className="font-semibold text-foreground">Check-out</TableHead>
                      <TableHead className="font-semibold text-foreground">Guests</TableHead>
                      <TableHead className="font-semibold text-foreground">Amount</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-foreground">Source</TableHead>
                      <TableHead className="font-semibold text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow 
                        key={booking.id}
                        className="hover:bg-muted/30 border-b border-sidebar-border transition-colors"
                      >
                        <TableCell className="font-medium text-foreground">{booking.id}</TableCell>
                        <TableCell className="text-foreground">{booking.guest}</TableCell>
                        <TableCell className="font-medium text-foreground">{booking.room}</TableCell>
                        <TableCell className="text-muted-foreground">{booking.checkIn}</TableCell>
                        <TableCell className="text-muted-foreground">{booking.checkOut}</TableCell>
                        <TableCell className="text-foreground">{booking.guests}</TableCell>
                        <TableCell className="font-semibold text-primary">{booking.amount}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              booking.status === 'confirmed'
                                ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                                : booking.status === 'pending'
                                ? 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
                                : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                            }
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{booking.source}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="hover:bg-sidebar-accent">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-sidebar-border">
                              <DropdownMenuItem className="hover:bg-sidebar-accent cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-sidebar-accent cursor-pointer">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="mt-6">
          <Card className="shadow-sm border-sidebar-border bg-card">
            <CardContent className="p-12">
              <p className="text-muted-foreground text-center text-lg">
                Calendar view coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-6">
          <Card className="shadow-sm border-sidebar-border bg-card">
            <CardContent className="p-12">
              <p className="text-muted-foreground text-center text-lg">
                Integrations coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}