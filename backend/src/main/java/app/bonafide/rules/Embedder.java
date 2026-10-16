package app.bonafide.rules;

import java.util.List;

/** Port over Gemini embeddings (768 dimensions, L2-normalised). */
public interface Embedder {

    List<Float> embed(String text);
}
