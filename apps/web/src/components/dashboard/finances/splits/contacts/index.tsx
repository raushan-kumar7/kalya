'use client';

import React, { useMemo, useState } from 'react';
import {
  useFinanceModal,
  useSplitContactActions,
  useSplitContactsQuery,
  useSplitContactSuggestionsQuery,
} from '@/hooks/finances';
import { SplitContactCard, CreateSplitContactCard, SplitContactCardSkeleton } from './card';
import { SplitContactForm } from '@/components/forms/finances';
import {
  Button,
  EmptyState,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui';
import { AlertTriangle, Search, Sparkles, UserPlus, Users, X } from 'lucide-react';
import { cn } from '@/libs/utils';
import type {
  SplitContactMember,
  CreateSplitContactMemberDto,
  UpdateSplitContactMemberDto,
} from '@kalya/types';
import type {
  CreateSplitContactMemberInput,
  UpdateSplitContactMemberInput,
} from '@kalya/validations';

const SKELETON_COUNT = 6;
type FilterTab = 'all' | 'linked' | 'external';

export function SplitContacts() {
  // Queries
  const { data: contacts = [], isLoading, error, refetch } = useSplitContactsQuery();
  const { data: suggestions = [] } = useSplitContactSuggestionsQuery();

  // Actions
  const {
    createContact,
    updateContact,
    linkContact,
    deleteContact,
    isCreating,
    isUpdating,
    isLinking,
    isDeleting,
  } = useSplitContactActions();
  // Modal
  const { activeModal, openModal, closeModal, activeContactId, setActiveContactId } =
    useFinanceModal();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [pendingDelete, setPendingDelete] = useState<SplitContactMember | null>(null);

  // Map suggestions by contact_id
  const suggestionsByContactId = useMemo(() => {
    return new Map(suggestions.map((s) => [s.contact_id, s]));
  }, [suggestions]);

  // Active contact selected for edit mode
  const editingContact = useMemo(() => {
    if (activeModal === 'edit-split-contact' && activeContactId) {
      return contacts.find((c) => c.id === activeContactId) ?? null;
    }
    return null;
  }, [activeModal, activeContactId, contacts]);

  // Statistics
  const linkedCount = useMemo(() => {
    return contacts.filter((c) => Boolean(c.is_linked ?? (c as any).isLinked)).length;
  }, [contacts]);

  const externalCount = contacts.length - linkedCount;

  // Real-time filtered & searched contacts
  const filteredContacts = useMemo(() => {
    let list = contacts;

    if (filterTab === 'linked') {
      list = list.filter((c) => Boolean(c.is_linked ?? (c as any).isLinked));
    } else if (filterTab === 'external') {
      list = list.filter((c) => !Boolean(c.is_linked ?? (c as any).isLinked));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [contacts, filterTab, searchQuery]);

  const handleSaveContact = async (
    payload: CreateSplitContactMemberInput | UpdateSplitContactMemberInput
  ) => {
    if (activeModal === 'edit-split-contact' && activeContactId) {
      const res = await updateContact(activeContactId, payload as UpdateSplitContactMemberDto);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to update contact');
      }
      setActiveContactId(null);
    } else {
      const res = await createContact(payload as CreateSplitContactMemberDto);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to create contact');
      }
    }
  };

  const handleLinkContact = async (member: SplitContactMember) => {
    const match = suggestionsByContactId.get(member.id);
    if (match) {
      await linkContact(member.id, {
        linked_user_id: match.matched_user.id,
        auto_sync_profile: true,
      });
    } else {
      setActiveContactId(member.id);
      openModal('edit-split-contact', member.id);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const res = await deleteContact(pendingDelete.id);
    if (res.success) {
      setPendingDelete(null);
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col space-y-6">
      {/* Header Section */}
      <div className="shrink-0 space-y-5 mt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-display-md text-text-primary">Split contacts</h2>
            <p className="text-body-sm text-text-secondary mt-1">
              {isLoading ? (
                'Loading contacts…'
              ) : error ? (
                <span className="text-danger">{error.message}</span>
              ) : (
                `${contacts.length} ${contacts.length === 1 ? 'contact' : 'contacts'}${
                  linkedCount > 0 ? ` · ${linkedCount} linked to Kalya accounts` : ''
                }`
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => openModal('add-split-contact')}
              className="shrink-0 gap-1.5"
              disabled={isLoading}
            >
              <UserPlus size={16} />
              Add contact
            </Button>
          </div>
        </div>

        {/* Toolbar: Search + Filter Tabs */}
        {!isLoading && contacts.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised p-1">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={cn(
                  'rounded-md px-3 py-1 text-caption font-medium transition-colors',
                  filterTab === 'all'
                    ? 'bg-surface text-text-primary shadow-xs'
                    : 'text-text-muted hover:text-text-secondary'
                )}
              >
                All ({contacts.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('linked')}
                className={cn(
                  'rounded-md px-3 py-1 text-caption font-medium transition-colors',
                  filterTab === 'linked'
                    ? 'bg-surface text-text-primary shadow-xs'
                    : 'text-text-muted hover:text-text-secondary'
                )}
              >
                Linked ({linkedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('external')}
                className={cn(
                  'rounded-md px-3 py-1 text-caption font-medium transition-colors',
                  filterTab === 'external'
                    ? 'bg-surface text-text-primary shadow-xs'
                    : 'text-text-muted hover:text-text-secondary'
                )}
              >
                External ({externalCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-72">
              <Input
                size="sm"
                placeholder="Search name, email or phone…"
                leadingIcon={<Search className="text-text-muted h-3.5 w-3.5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                clearable
                onClear={() => setSearchQuery('')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="min-h-0 flex-1 space-y-8 overflow-y-auto pb-8">
        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SplitContactCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Global Empty State: No contacts yet */}
        {!isLoading && contacts.length === 0 && (
          <EmptyState
            icon={<Users className="h-6 w-6 text-text-muted" />}
            title="No split contacts yet"
            description="Add friends, housemates, or peers to split bills, divide shared expenses, and track who owes what."
            action={
              <Button
                onClick={() => openModal('add-split-contact')}
                leadingIcon={<UserPlus size={16} />}
              >
                Add first contact
              </Button>
            }
          />
        )}

        {/* Search Empty State */}
        {!isLoading && contacts.length > 0 && filteredContacts.length === 0 && (
          <EmptyState
            icon={<Search className="h-6 w-6 text-text-muted" />}
            title="No matching contacts"
            description={
              searchQuery
                ? `No contacts found matching "${searchQuery}". Try a different search term or clear the filter.`
                : 'No contacts found under this filter.'
            }
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterTab('all');
                }}
                leadingIcon={<X className="h-4 w-4" />}
              >
                Clear filters
              </Button>
            }
          />
        )}

        {/* Kalya User Matches / Link Suggestions Banner */}
        {!isLoading && suggestions.length > 0 && (
          <div className="flex flex-col gap-3 rounded-xl border border-accent/30 bg-accent-subtle/25 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent">
                <Sparkles size={18} className="animate-pulse" />
              </div>
              <div>
                <p className="text-body-sm font-medium text-text-primary">
                  {suggestions.length} {suggestions.length === 1 ? 'contact' : 'contacts'} found on
                  Kalya!
                </p>
                <p className="text-caption text-text-secondary">
                  Match found via email or phone. Link them to sync avatars, profiles, and two-way
                  split requests.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  for (const s of suggestions) {
                    await linkContact(s.contact_id, {
                      linked_user_id: s.matched_user.id,
                      auto_sync_profile: true,
                    });
                  }
                }}
                disabled={isLinking}
                isLoading={isLinking}
                className="text-caption bg-surface border-accent/40 text-accent hover:border-accent"
              >
                <Sparkles size={14} className="mr-1.5" />
                Link all ({suggestions.length})
              </Button>
            </div>
          </div>
        )}

        {/* Contacts Grid */}
        {!isLoading && filteredContacts.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            <CreateSplitContactCard onClick={() => openModal('add-split-contact')} />
            {filteredContacts.map((member) => (
              <SplitContactCard
                key={member.id}
                member={member}
                suggestedMatch={suggestionsByContactId.get(member.id)}
                onEdit={() => {
                  setActiveContactId(member.id);
                  openModal('edit-split-contact', member.id);
                }}
                onDelete={() => setPendingDelete(member)}
                onLink={handleLinkContact}
              />
            ))}
          </div>
        )}
      </div>

      {/* Shared Form Modal for Creating & Editing Split Contacts */}
      <SplitContactForm
        open={activeModal === 'add-split-contact' || activeModal === 'edit-split-contact'}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
            setActiveContactId(null);
          } else {
            openModal('add-split-contact');
          }
        }}
        splitContact={editingContact}
        onSave={handleSaveContact}
      />

      {/* Delete Confirmation Modal */}
      <Modal open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <ModalContent size="sm">
          <ModalHeader tone="danger" icon={<AlertTriangle className="h-5 w-5" />}>
            <ModalTitle>Delete contact</ModalTitle>
            <ModalDescription>
              {pendingDelete && (
                <>
                  Are you sure you want to remove{' '}
                  <strong className="text-text-primary">
                    {pendingDelete.name || 'this contact'}
                  </strong>
                  ? They will no longer appear in your active split contacts list.
                </>
              )}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Delete contact
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}

export default SplitContacts;
