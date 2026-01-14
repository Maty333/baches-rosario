import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { commentsAPI } from "../../api/comments.js";
import { toast } from "react-toastify";
import { sanitizeText } from "../../utils/sanitize.js";
import "../../styles/CommentSection.css";

const CommentSection = ({ bacheId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadComments();
  }, [bacheId]);

  const loadComments = async () => {
    try {
      const data = await commentsAPI.getByBache(bacheId);
      setComments(data);
    } catch (error) {
      console.error("Error cargando comentarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const comment = await commentsAPI.create(bacheId, newComment);
      setComments([comment, ...comments]);
      setNewComment("");
      toast.success("Comentario agregado");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al agregar comentario");
    }
  };

  if (loading) {
    return <div>Cargando comentarios...</div>;
  }

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">Comentarios ({comments.length})</h3>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            className="comment-input"
            rows="3"
          />
          <button type="submit" className="comment-submit">
            Comentar
          </button>
        </form>
      ) : (
        <p className="comment-login-message">Inicia sesión para comentar</p>
      )}

      <div className="comment-list">
        {comments.length === 0 ? (
          <p className="comment-empty">No hay comentarios aún</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <div className="comment-header">
                <strong className="comment-author">{comment.autor?.nombre || "Anónimo"}</strong>
                <span className="comment-date">
                  {new Date(comment.fecha).toLocaleDateString("es-AR")}
                </span>
              </div>
              <p className="comment-content">{sanitizeText(comment.contenido)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;

