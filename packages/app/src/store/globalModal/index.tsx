import type React from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { createStore, useStore } from 'zustand';
import { combine, subscribeWithSelector } from 'zustand/middleware';
import { UseBoundStore } from 'zustand/react';
import ContactModal from '@/components/contact-modal';
import ShortcutsModal from '@/components/shortcuts-modal';
import QuickSearch from '@/components/quick-search';
import { LoginModal } from '@/components/login-modal';
import ImportModal from '@/components/import';

export type ModalState = {
  contact: boolean;
  shortcuts: boolean;
  quickSearch: boolean;
  import: boolean;
  login: boolean;
};

export type ModalActions = {
  triggerShortcutsModal: () => void;
  triggerContactModal: () => void;
  triggerQuickSearchModal: (visible?: boolean) => void;
  triggerImportModal: () => void;
  triggerLoginModal: () => void;
};

const create = () =>
  createStore(
    subscribeWithSelector(
      combine<ModalState, ModalActions>(
        {
          contact: false,
          shortcuts: false,
          quickSearch: false,
          import: false,
          login: false,
        },
        set => ({
          triggerShortcutsModal: () => {
            set(({ shortcuts }) => ({
              shortcuts: !shortcuts,
            }));
          },
          triggerContactModal: () => {
            set(({ contact }) => ({
              contact: !contact,
            }));
          },
          triggerQuickSearchModal: (visible?: boolean) => {
            set(({ quickSearch }) => ({
              quickSearch: visible ?? !quickSearch,
            }));
          },
          triggerImportModal: () => {
            set(state => ({
              import: !state.import,
            }));
          },
          triggerLoginModal: () => {
            set(({ login }) => ({
              login: !login,
            }));
          },
        })
      )
    )
  );
type Store = ReturnType<typeof create>;

const ModalContext = createContext<Store | null>(null);

export const useModalApi = () => {
  const api = useContext(ModalContext);
  if (!api) {
    throw new Error('cannot find modal context');
  }
  return api;
};

export const useModal: UseBoundStore<Store> = ((
  selector: Parameters<UseBoundStore<Store>>[0],
  equals: Parameters<UseBoundStore<Store>>[1]
) => {
  const api = useModalApi();
  return useStore(api, selector, equals);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

const Modals: React.FC = function Modal() {
  const api = useModalApi();
  return (
    <>
      <ContactModal
        open={useModal(state => state.contact)}
        onClose={useCallback(() => {
          api.setState({
            contact: false,
          });
        }, [api])}
      ></ContactModal>
      <ShortcutsModal
        open={useModal(state => state.shortcuts)}
        onClose={useCallback(() => {
          api.setState({
            shortcuts: false,
          });
        }, [api])}
      ></ShortcutsModal>
      <QuickSearch
        open={useModal(state => state.quickSearch)}
        onClose={useCallback(() => {
          api.setState({
            quickSearch: false,
          });
        }, [api])}
      ></QuickSearch>
      <ImportModal
        open={useModal(state => state.import)}
        onClose={useCallback(() => {
          api.setState({
            import: false,
          });
        }, [api])}
      ></ImportModal>
      <LoginModal
        open={useModal(state => state.login)}
        onClose={useCallback(() => {
          api.setState({
            login: false,
          });
        }, [api])}
      />
    </>
  );
};

export const ModalProvider: React.FC<React.PropsWithChildren> =
  function ModelProvider({ children }) {
    return (
      <ModalContext.Provider value={useMemo(() => create(), [])}>
        <Modals />
        {children}
      </ModalContext.Provider>
    );
  };
