import { useCallback } from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Checkbox from "@material-ui/core/Checkbox";
import CreateIcon from "@material-ui/icons/Create";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import { motion } from "framer-motion";
import { TodoItem, useTodoItems } from "../TodoItemsContext";
import { Droppable, Draggable } from "react-beautiful-dnd";
import ReactModal from "react-modal";
import { useForm, Controller } from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { useState } from "react";

ReactModal.setAppElement("#root");

const useInputStyles = makeStyles(() => ({
  root: {
    marginBottom: 24,
  },
}));

const spring = {
  type: "spring",
  damping: 25,
  stiffness: 120,
  duration: 0.25,
};

const useTodoItemListStyles = makeStyles({
  root: {
    listStyle: "none",
    padding: 0,
  },
});

export const TodoItemsList = function () {
  const { todoItems } = useTodoItems();

  const classes = useTodoItemListStyles();

  const sortedItems = todoItems.slice().sort((a, b) => {
    if (a.done && !b.done) {
      return 1;
    }

    if (!a.done && b.done) {
      return -1;
    }

    return 0;
  });

  return (
    <Droppable droppableId="1">
      {(provided) => (
        <ul
          className={classes.root}
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          {sortedItems.map((item, index) => (
            <motion.li key={item.id} transition={spring} layout={true}>
              <Draggable draggableId={item.id} index={index}>
                {(provided) => (
                  <div
                    {...provided.dragHandleProps}
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                  >
                    <TodoItemCard item={item} />
                  </div>
                )}
              </Draggable>
            </motion.li>
          ))}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  );
};

const useTodoItemCardStyles = makeStyles({
  root: {
    marginTop: 24,
    marginBottom: 24,
  },
  doneRoot: {
    textDecoration: "line-through",
    color: "#888888",
  },
});

export const TodoItemCard = function ({ item }: { item: TodoItem }) {
  const classes = useTodoItemCardStyles();
  const { dispatch } = useTodoItems();
  const [isChanging, setisChanging] = useState(false);

  const handleDelete = useCallback(
    () => dispatch({ type: "delete", data: { id: item.id } }),
    [item.id, dispatch]
  );

  const handleToggleDone = useCallback(
    () =>
      dispatch({
        type: "toggleDone",
        data: { id: item.id },
      }),
    [item.id, dispatch]
  );

  return (
    <Card
      className={classnames(classes.root, {
        [classes.doneRoot]: item.done,
      })}
    >
      <CardHeader
        action={
          <div>
            <IconButton
              aria-label="change"
              onClick={() => {
                setisChanging(true);
              }}
            >
              <CreateIcon />
            </IconButton>
            <IconButton aria-label="delete" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </div>
        }
        title={
          <FormControlLabel
            control={
              <Checkbox
                checked={item.done}
                onChange={handleToggleDone}
                name={`checked-${item.id}`}
                color="primary"
              />
            }
            label={item.title}
          />
        }
      />
      {item.details ? (
        <CardContent>
          <Typography variant="body2" component="p">
            {item.details}
          </Typography>
        </CardContent>
      ) : null}

      <ReactModal isOpen={isChanging}>
        <TodoItemChangeFrom item={item} submit={() => setisChanging(false)} />
      </ReactModal>
    </Card>
  );
};

function TodoItemChangeFrom({
  item,
  submit,
}: {
  item: TodoItem;
  submit: Function;
}) {
  const classes = useInputStyles();
  const { dispatch } = useTodoItems();
  const { control, handleSubmit } = useForm();

  return (
    <form
      onSubmit={handleSubmit((formData) => {
        submit();
        dispatch({ type: "update", data: { id: item.id, newData: formData } });
      })}
    >
      <Controller
        name="title"
        control={control}
        defaultValue={item.title}
        rules={{ required: true }}
        render={({ field }) => (
          <TextField
            {...field}
            label="TODO"
            fullWidth={true}
            className={classes.root}
          />
        )}
      />
      <Controller
        name="details"
        control={control}
        defaultValue={item.details}
        render={({ field }) => (
          <TextField
            {...field}
            label="Details"
            fullWidth={true}
            multiline={true}
            className={classes.root}
          />
        )}
      />
      <Button variant="contained" color="primary" type="submit">
        Update
      </Button>
    </form>
  );
}
