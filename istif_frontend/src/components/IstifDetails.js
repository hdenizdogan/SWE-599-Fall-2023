import axios from "axios";
import { useEffect, useState } from "react";
import parse from "html-react-parser";
import { useParams } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import "./css/AllIstifs.css";

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;

  return formattedDate;
}

function IstifDetails() {
  const { id } = useParams();
  const [istif, setIstif] = useState(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/istif/${id}`, {
        withCredentials: true,
      })
      .then((response) => {
        setIstif(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [id]);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    const comment = {
      istifId: istif.id,
      commentText: commentText,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/comment/add`,
        comment,
        {
          withCredentials: true,
        }
      );
      console.log(comment);
      const updatedIstif = { ...istif };
      updatedIstif.comments.push(response.data);
      setIstif(updatedIstif);
      setCommentText("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleLikeIstif = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/istif/like/`,
        { likedEntityId: istif.id },
        {
          withCredentials: true,
        }
      );
      setIstif(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleLikeComment = async (commentId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/comment/like/`,
        { likedEntityId: commentId },
        {
          withCredentials: true,
        }
      );
      const updatedIstif = { ...istif };
      const updatedComments = updatedIstif.comments.map((comment) => {
        if (comment.id === commentId) {
          return response.data;
        }
        return comment;
      });
      updatedIstif.comments = updatedComments;
      setIstif(updatedIstif);
    } catch (error) {
      console.log(error);
    }
  };

  if (!istif) {
    return <div>Istif Not Found!</div>;
  }

  return (
    <div className="all-istifs">
      <h1>Title: {istif.title}</h1>
      <p>
        <b>Istif:</b>
        <p></p>
        {parse(istif.text)}
      </p>
      <p>
        <b>Likes:</b> {istif.likes ? istif.likes.length : 0}
      </p>
      <button onClick={handleLikeIstif}>Like!</button>
      <p>
        <b>Labels:</b> {istif.labels.join(", ")}
      </p>
      <b>Written by:</b>
      <a href={"/user/" + istif.user.id}>{istif.user.username}</a>
      <p>
        <b>Start Date:</b> {istif.startTimeStamp}
      </p>
      <p>
        <b>End Date:</b> {istif.endTimeStamp}
      </p>
      <p>
        <b>Published at: </b>
        {formatDate(istif.createdAt)}
      </p>
      <p>
        <b>Season:</b>
        {istif.season}
      </p>
      <p>
        <b>Decade:</b>
        {istif.decade}
      </p>
      <label>
        <b>Selected Locations:</b>
        <ul className="locations-list">
          {istif.locations.map((location) => (
            <li key={location.id}>{location.locationName}</li>
          ))}
        </ul>
      </label>
      <p>
        <b>Comments:</b>
      </p>
      <ul>
        {istif.comments.map((comment) => (
          <li key={comment.id}>
            <b>Comment: </b>
            {comment.text}
            <p>
              <b>Commented by: </b>
              {comment.user.username}
            </p>
            <p>
              <b>Likes:</b> {comment.likes ? comment.likes.length : 0}
              <button onClick={() => handleLikeComment(comment.id)}>
                Like
              </button>
            </p>
          </li>
        ))}
      </ul>
      <form onSubmit={handleCommentSubmit}>
        <label>
          Add Comment:
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          ></textarea>
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default IstifDetails;
