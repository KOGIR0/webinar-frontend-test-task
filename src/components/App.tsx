import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import { TodoItemsList } from "./TodoItems";
import { TodoItemsContextProvider, useTodoItems } from "../TodoItemsContext";
import TodoItemForm from "./TodoItemForm";
import { DragDropContext } from "react-beautiful-dnd";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#9012fe",
    },
    secondary: {
      main: "#b2aabf",
    },
  },
});

function App() {
  return (
    <TodoItemsContextProvider>
      <ThemeProvider theme={theme}>
        <Content />
      </ThemeProvider>
    </TodoItemsContextProvider>
  );
}

function Content() {
  const { dispatch } = useTodoItems();

  const onDragEnd = (result: any) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (
      destination.dropableId === source.dropableId &&
      destination.index === source.index
    ) {
      return;
    }

    dispatch({
      type: "move",
      data: { source: source.index, destination: destination.index },
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container maxWidth="sm">
        <header>
          <Typography variant="h2" component="h1">
            Todo List
          </Typography>
        </header>
        <main>
          <TodoItemForm />
          <TodoItemsList />
        </main>
      </Container>
    </DragDropContext>
  );
}

export default App;
