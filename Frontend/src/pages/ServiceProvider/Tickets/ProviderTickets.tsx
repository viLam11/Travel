// src/pages/ServiceProvider/Tickets/ProviderTickets.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import { Label } from '@/components/ui/admin/label';
import { Textarea } from '@/components/ui/admin/textarea';
import { Badge } from '@/components/ui/admin/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/admin/dialog';
import { Plus, Edit, Trash2, Ticket } from 'lucide-react';
import { type MockTicket } from '@/mocks/tickets';
import { ticketApi } from '@/api/ticketApi';
import { useToast } from '@/contexts/ToastContext';

const ProviderTickets = () => {
    // Mock: Get current provider's tour ID (in real app, from auth context)
    const currentTourId = 6; // Ha Long Bay Cruise
    const tourName = "Ha Long Bay Cruise";
    const { toast } = useToast();

    const [tickets, setTickets] = useState<MockTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch tickets on mount
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const data = await ticketApi.getTicketsByService(currentTourId);
                setTickets(data);
            } catch (error) {
                console.error("Failed to load tickets", error);
                toast("Lỗi tải danh sách vé", "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTickets();
    }, [currentTourId, toast]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<MockTicket | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        maxQuantity: '',
        description: '',
        content: '',
    });

    const handleOpenDialog = (ticket?: MockTicket) => {
        if (ticket) {
            setEditingTicket(ticket);
            setFormData({
                name: ticket.name,
                price: ticket.price.toString(),
                maxQuantity: ticket.maxQuantity.toString(),
                description: ticket.description,
                content: ticket.content,
            });
        } else {
            setEditingTicket(null);
            setFormData({
                name: '',
                price: '',
                maxQuantity: '',
                description: '',
                content: '',
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingTicket(null);
    };

    const handleSave = async () => {
        try {
            if (editingTicket) {
                // Update existing ticket
                const updateData = {
                    name: formData.name,
                    price: parseInt(formData.price),
                    maxQuantity: parseInt(formData.maxQuantity),
                    description: formData.description,
                    content: formData.content,
                };
                await ticketApi.updateTicket(editingTicket.id, updateData);
                
                setTickets(prev => prev.map(ticket =>
                    ticket.id === editingTicket.id
                        ? { ...ticket, ...updateData }
                        : ticket
                ));
                toast(`Cập nhật thành công: ${formData.name}`, "success");
            } else {
                // Add new ticket
                const newData = {
                    tourName: tourName,
                    name: formData.name,
                    price: parseInt(formData.price),
                    maxQuantity: parseInt(formData.maxQuantity),
                    available: parseInt(formData.maxQuantity),
                    description: formData.description,
                    content: formData.content,
                };
                const newTicket = await ticketApi.createTicket(currentTourId, newData);
                setTickets(prev => [...prev, newTicket]);
                toast(`Thêm vé thành công: ${formData.name}`, "success");
            }
            handleCloseDialog();
        } catch (error) {
            console.error("Save failed", error);
            toast("Thao tác thất bại", "error");
        }
    };

    const handleDelete = async (ticket: MockTicket) => {
        if (confirm(`Are you sure you want to delete "${ticket.name}"?`)) {
            try {
                await ticketApi.deleteTicket(ticket.id);
                setTickets(prev => prev.filter(t => t.id !== ticket.id));
                toast(`Đã xóa vé: ${ticket.name}`, "success");
            } catch (error) {
                console.error("Delete failed", error);
                toast("Xóa thất bại", "error");
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ticket Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage tickets for {tourName}
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Ticket Type
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tickets.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {tickets.reduce((sum, ticket) => sum + ticket.maxQuantity, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Tickets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {tickets.reduce((sum, ticket) => sum + ticket.available, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tickets List */}
            {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">Đang tải danh sách vé...</div>
            ) : tickets.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground border rounded-lg bg-card">
                    Bạn chưa tạo loại vé nào cho dịch vụ này.
                </div>
            ) : (
                <div className="space-y-4">
                    {tickets.map((ticket) => (
                        <Card key={ticket.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <Ticket className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-semibold text-lg">{ticket.name}</h3>
                                                <Badge variant={ticket.available > 0 ? 'default' : 'secondary'}>
                                                    {ticket.available > 0 ? 'Available' : 'Sold Out'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {ticket.description}
                                            </p>
                                            <div className="bg-muted/50 p-3 rounded-md">
                                                <p className="text-sm font-medium mb-1">What's Included:</p>
                                                <p className="text-sm text-muted-foreground">{ticket.content}</p>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Price: </span>
                                                    <span className="font-semibold text-lg text-primary">
                                                        {ticket.price.toLocaleString('vi-VN')} ₫
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Availability: </span>
                                                    <span className="font-medium">
                                                        {ticket.available}/{ticket.maxQuantity}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => handleOpenDialog(ticket)}
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(ticket)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTicket ? 'Edit Ticket Type' : 'Add Ticket Type'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTicket ? 'Update ticket details' : 'Create a new ticket type for your tour'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Ticket Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Adult Ticket"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (VND) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="e.g., 2500000"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxQuantity">Max Quantity *</Label>
                            <Input
                                id="maxQuantity"
                                type="number"
                                placeholder="e.g., 50"
                                value={formData.maxQuantity}
                                onChange={(e) => setFormData(prev => ({ ...prev, maxQuantity: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of this ticket type..."
                                rows={2}
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">What's Included *</Label>
                            <Textarea
                                id="content"
                                placeholder="List what's included with this ticket..."
                                rows={3}
                                value={formData.content}
                                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {editingTicket ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProviderTickets;
