import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ClientsTable } from './clients-table';
import type { ClientModel } from '@models/facility';
import { Timestamp } from 'firebase/firestore';

const mockClients: ClientModel[] = [
  {
    uid: '123',
    joined: Timestamp.now(),
    isActive: true,
    profile: {
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: Timestamp.now(),
      img: null,
    },
  },
  {
    uid: '456',
    joined: Timestamp.now(),
    isActive: false,
    profile: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: Timestamp.now(),
      img: null,
    },
  },
];

describe('ClientsTable', () => {
  it('renders a list of clients', () => {
    render(
      <MemoryRouter>
        <ClientsTable clients={mockClients} />
      </MemoryRouter>
    );

    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('john@example.com')).toBeDefined();
    expect(screen.getByText('Jane Smith')).toBeDefined();
    expect(screen.getByText('jane@example.com')).toBeDefined();
    expect(screen.getByText('Activo')).toBeDefined();
    expect(screen.getByText('Inactivo')).toBeDefined();
  });

  it('renders an empty table when no clients are provided', () => {
    render(
      <MemoryRouter>
        <ClientsTable clients={[]} />
      </MemoryRouter>
    );

    const rows = screen.queryAllByRole('row');
    // Header only
    expect(rows.length).toBe(1);
  });
});
