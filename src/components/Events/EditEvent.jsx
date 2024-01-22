import {
  Link,
  useNavigate,
  useParams,
  redirect,
  useSubmit,
  useNavigation,
} from "react-router-dom";
import {
  useQuery,
  //  useMutation
} from "@tanstack/react-query";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, updateEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { queryClient } from "../../util/http.js";

export default function EditEvent() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const state = navigation.state;
  const { id } = useParams();
  const submit = useSubmit();
  const { data, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
    staleTime: 10000
  });
  // const {mutate} = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data)=>{
  //     const newEvent = data.event
  //     await queryClient.cancelQueries({queryKey: ["events", id]})
  //     const prevEvent = queryClient.getQueryData(["events", id])
  //     queryClient.setQueryData(["events", id], {
  //       ...newEvent,
  //       isUpdating: true,
  //     });
  //     return {prevEvent}
  //   },
  //   onError: (error, data, context)=>{
  //     queryClient.setQueryData(["events", id],context.prevEvent)
  //   },
  //   onSettled:()=>{
  //     queryClient.invalidateQueries(["events", id])
  //   }

  // })
  function handleSubmit(formData) {
    // mutate({id:id, event:formData})
    // navigate("../")
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  let content;
  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to fetch selected event"
          message={error.info?.message || "Try again later"}
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }
  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === "submitting" ? (
          <p>Sending data...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export async function loader({ params }) {
  const id = params.id;
  return queryClient.fetchQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });
}

export async function action({ request, params }) {
  const id = params.id;
  const formData = await request.formData();
  const updatedEvent = Object.fromEntries(formData);
  await updateEvent({ id, event: updatedEvent });
  await queryClient.invalidateQueries();
  return redirect("../");
}
