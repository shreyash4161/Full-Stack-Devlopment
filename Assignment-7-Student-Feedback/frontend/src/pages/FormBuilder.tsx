import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formsAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Question } from '../types';

const FormBuilder: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchForm = async () => {
        try {
          const res = await formsAPI.getFormById(id);
          const form = res.form;
          setTitle(form.title);
          setDescription(form.description);
          setQuestions(form.questions || []);
        } catch {
          alert('Failed to load form');
        } finally {
          setLoading(false);
        }
      };
      fetchForm();
    }
  }, [id]);

  // ✅ ADD QUESTION
  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        _id: `temp-${Date.now()}`,
        text: '',
        type: 'text',
        required: true,
        options: [],
      },
    ]);
  };

  // ✅ UPDATE QUESTION
  const updateQuestion = (index: number, field: string, value: any) => {
    setQuestions(prev => {
      const updated = [...prev];

      let updatedQuestion = {
        ...updated[index],
        [field]: value,
      };

      // initialize options if multiple-choice
      if (field === 'type' && value === 'multiple-choice') {
        updatedQuestion.options = ['', ''];
      }

      updated[index] = updatedQuestion;
      return updated;
    });
  };

  // ✅ REMOVE QUESTION
  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ HANDLE OPTION CHANGE (FIXED IMMUTABLE)
  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      const newOptions = [...(updated[qIndex].options || [])];

      newOptions[optIndex] = value;

      updated[qIndex] = {
        ...updated[qIndex],
        options: newOptions,
      };

      return updated;
    });
  };

  // ✅ ADD OPTION
  const addOption = (qIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      const newOptions = [...(updated[qIndex].options || []), ''];

      updated[qIndex] = {
        ...updated[qIndex],
        options: newOptions,
      };

      return updated;
    });
  };

  // ✅ REMOVE OPTION
  const removeOption = (qIndex: number, optIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      const newOptions = updated[qIndex].options.filter((_, i) => i !== optIndex);

      updated[qIndex] = {
        ...updated[qIndex],
        options: newOptions,
      };

      return updated;
    });
  };

  const handleSave = async () => {
    if (!title.trim()) return alert('Enter title');
    if (questions.length === 0) return alert('Add questions');

    setSaving(true);
    try {
      if (id) {
        await formsAPI.updateForm(id, { title, description, questions });
      } else {
        await formsAPI.createForm({ title, description, questions });
      }
      navigate('/instructor');
    } catch {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 p-6 text-white">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* FORM INFO */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle>{id ? 'Edit Form' : 'Create New Form'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Form Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </CardContent>
        </Card>

        {/* QUESTIONS */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Questions</CardTitle>
            <Button onClick={addQuestion} className="bg-blue-600 hover:bg-blue-700">
              Add Question
            </Button>
          </CardHeader>

          <CardContent className="space-y-5">
            {questions.map((q, index) => (
              <div
                key={q._id}
                className="p-5 bg-gray-800 rounded-xl border border-gray-700 space-y-4"
              >
                <Input
                  placeholder="Question text"
                  value={q.text}
                  onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                />

                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded"
                >
                  <option value="text">Short Text</option>
                  <option value="textarea">Long Text</option>
                  <option value="rating">Rating</option>
                  <option value="multiple-choice">Multiple Choice</option>
                </select>

                {/* OPTIONS */}
                {q.type === 'multiple-choice' && (
                  <div className="space-y-3 bg-gray-900 p-3 rounded border border-gray-700">
                    <Label>Options</Label>

                    {q.options?.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={opt}
                          placeholder={`Option ${i + 1}`}
                          onChange={(e) =>
                            handleOptionChange(index, i, e.target.value)
                          }
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                        <Button
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => removeOption(index, i)}
                        >
                          X
                        </Button>
                      </div>
                    ))}

                    <Button
                      onClick={() => addOption(index)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      + Add Option
                    </Button>
                  </div>
                )}

                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => removeQuestion(index)}
                >
                  Remove Question
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <Button className="bg-gray-700" onClick={() => navigate('/instructor')}>
            Cancel
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
            Save
          </Button>
        </div>

      </div>
    </div>
  );
};

export default FormBuilder;