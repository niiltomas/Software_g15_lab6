import React, { useState, useEffect } from 'react';
import './App.css';

type Recipe = {
    name: string;
    ingredients: string[];
    steps: string;
};

const RECIPES_KEY = 'recipes';

const App: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [form, setForm] = useState({ name: '', ingredient: '', ingredients: [] as string[], steps: '' });
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [lastAdded, setLastAdded] = useState<Recipe | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem(RECIPES_KEY);
        if (saved) setRecipes(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
    }, [recipes]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAddIngredient = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.ingredient.trim() !== '') {
            setForm(f => ({
                ...f,
                ingredients: [...f.ingredients, f.ingredient.trim()],
                ingredient: ''
            }));
        }
    };

    const handleRemoveIngredient = (idx: number) => {
        setForm(f => ({
            ...f,
            ingredients: f.ingredients.filter((_, i) => i !== idx)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || form.ingredients.length === 0 || !form.steps) return;
        const newRecipe: Recipe = {
            name: form.name,
            ingredients: form.ingredients,
            steps: form.steps
        };
        setRecipes(prev => [...prev, newRecipe]);
        setLastAdded(newRecipe);
        setShowConfirmation(true);
        setForm({ name: '', ingredient: '', ingredients: [], steps: '' });
    };

    const handleUndo = () => {
        if (!lastAdded) return;
        setRecipes(prev => prev.slice(0, -1));
        setShowConfirmation(false);
        setLastAdded(null);
    };

    return (
        <div className="app-container">
            <header className="header">
                <h1 className="title">RecipeMe</h1>
            </header>

            <main>
                <section className="form-section">
                    <h2>Add a New Recipe</h2>
                    <form onSubmit={handleSubmit} className="recipe-form">
                        <div className="form-group">
                            <label>
                                Name:
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                        </div>
                        <div className="form-group">
                            <label>
                                Ingredients:
                                <div className="ingredient-input-row">
                                    <input
                                        name="ingredient"
                                        value={form.ingredient}
                                        onChange={handleChange}
                                        placeholder="Add ingredient"
                                    />
                                    <button onClick={handleAddIngredient} className="add-ingredient-btn" type="button">Add</button>
                                </div>
                                <ul className="ingredient-list">
                                    {form.ingredients.map((ing, idx) => (
                                        <li key={idx}>
                                            {ing}
                                            <button type="button" className="remove-ingredient-btn" onClick={() => handleRemoveIngredient(idx)}>×</button>
                                        </li>
                                    ))}
                                </ul>
                            </label>
                        </div>
                        <div className="form-group">
                            <label>
                                Preparation Steps:
                                <textarea
                                    name="steps"
                                    value={form.steps}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                        </div>
                        <button type="submit" className="submit-btn">Add Recipe</button>
                    </form>
                    {showConfirmation && (
                        <div className="confirmation">
                            Recipe added!
                            <button onClick={handleUndo} className="undo-btn">Undo</button>
                        </div>
                    )}
                </section>

                <section className="recipes-section">
                    <h2>Recipes</h2>
                    <ul className="recipes-list">
                        {recipes.map((r, idx) => (
                            <li key={idx} className="recipe-card">
                                <strong>{r.name}</strong>
                                <div>
                                    <b>Ingredients:</b>
                                    <ul>
                                        {r.ingredients.map((ing, i) => (
                                            <li key={i}>{ing}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div><b>Steps:</b> {r.steps}</div>
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    );
};

export default App;