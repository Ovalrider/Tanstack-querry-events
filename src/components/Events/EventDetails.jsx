import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import Header from "../Header.jsx";
import { deleteEvent } from "../../util/http.js";
import { queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { fetchEvent } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";

export default function EventDetails() {
  const navigate = useNavigate();
  const params = useParams();
  const {
    data: event,
    isError: isGetError,
    error: getError,
    isPending,
  } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });
  const {
    isError: isDeleteError,
    error: deleteError,
    mutate,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });
  function handleDelete() {
    const proceed = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (proceed) {
      mutate({ id: params.id });
    }
  }
  let content;
  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
        <p>Fetching event data...</p>
      </div>
    );
  }
  if (isGetError) {
    content = (
      <ErrorBlock
        title="Failed to load event"
        message={getError.info?.message || "Try again later"}
      />
    );
  }
  if (event) {
    const formatedDate = new Date(event.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    content = (
      <>
        <header>
          <h1>{event.title}</h1>
          <nav>
            <button onClick={handleDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${event.image}`} alt="" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{event.location}</p>
              <time dateTime="MM-DD-YYYY">
                {formatedDate} at {event.time}
              </time>
            </div>
            <p id="event-details-description">{event.description}</p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isDeleteError && (
        <ErrorBlock
          title="Failed to delete event."
          message={deleteError.info?.message || "Please try again later."}
        />
      )}

      <article id="event-details">{content}</article>
    </>
  );
}
