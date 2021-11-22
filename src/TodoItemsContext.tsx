import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";

export interface TodoItem {
  id: string;
  title: string;
  details?: string;
  done: boolean;
}

interface TodoItemsState {
  todoItems: TodoItem[];
}

interface TodoItemsAction {
  type: "loadState" | "add" | "move" | "delete" | "toggleDone" | "update";
  data: any;
}

const TodoItemsContext = createContext<
  (TodoItemsState & { dispatch: (action: TodoItemsAction) => void }) | null
>(null);

const defaultState = { todoItems: [] };
const localStorageKey = "todoListState";

export const TodoItemsContextProvider = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const [state, dispatch] = useReducer(todoItemsReducer, defaultState);

  useEffect(() => {
    const savedState = localStorage.getItem(localStorageKey);

    if (savedState) {
      try {
        dispatch({ type: "loadState", data: JSON.parse(savedState) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(state));
  }, [state]);

  return (
    <TodoItemsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TodoItemsContext.Provider>
  );
};

export const useTodoItems = () => {
  const todoItemsContext = useContext(TodoItemsContext);

  if (!todoItemsContext) {
    throw new Error(
      "useTodoItems hook should only be used inside TodoItemsContextProvider"
    );
  }

  return todoItemsContext;
};

function todoItemsReducer(state: TodoItemsState, action: TodoItemsAction) {
  switch (action.type) {
    case "loadState": {
      return action.data;
    }
    case "add":
      return {
        ...state,
        todoItems: [
          {
            id: generateId(),
            done: false,
            ...action.data.todoItem,
          },
          ...state.todoItems,
        ],
      };
    case "move":
      const draggedItem = state.todoItems[action.data.source];
      const newItems = state.todoItems.filter(
        (item, index) => index !== action.data.source
      );
      newItems.splice(action.data.destination, 0, draggedItem);
      if (
        (draggedItem.done && !state.todoItems[action.data.destination].done) ||
        (!draggedItem.done && state.todoItems[action.data.destination].done)
      ) {
        return { ...state };
      }
      return {
        ...state,
        todoItems: newItems,
      };
    case "delete":
      return {
        ...state,
        todoItems: state.todoItems.filter(({ id }) => id !== action.data.id),
      };
    case "toggleDone":
      const itemIndex = state.todoItems.findIndex(
        ({ id }) => id === action.data.id
      );
      const item = state.todoItems[itemIndex];

      return {
        ...state,
        todoItems: [
          ...state.todoItems.slice(0, itemIndex),
          { ...item, done: !item.done },
          ...state.todoItems.slice(itemIndex + 1),
        ],
      };
    case "update":
      const updateItemIndex = state.todoItems.findIndex(
        ({ id }) => id === action.data.id
      );
      state.todoItems[updateItemIndex].title = action.data.newData.title;
      state.todoItems[updateItemIndex].details = action.data.newData.details;
      return {
        ...state,
      };
    default:
      throw new Error();
  }
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.floor(
    Math.random() * 1e16
  ).toString(36)}`;
}
