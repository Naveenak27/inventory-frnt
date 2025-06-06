import React, { useState, useEffect, useContext } from 'react';
import { Button, Modal, Form, Input, message, Spin, Card, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AuthContext from '../pages/AuthContext';

const { TextArea } = Input;

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { user } = useContext(AuthContext);

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://note-n4cq.vercel.app/notes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch notes');
      setNotes(data.notes);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      const token = localStorage.getItem('token');
      const url = currentNote 
        ? `https://note-n4cq.vercel.app/notes/${currentNote.id}`
        : 'https://note-n4cq.vercel.app/notes';
      
      const res = await fetch(url, {
        method: currentNote ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values)
      });

      if (!res.ok) throw new Error('Operation failed');
      
      message.success(currentNote ? 'Note updated' : 'Note created');
      setModalVisible(false);
      form.resetFields();
      setCurrentNote(null);
      fetchNotes();
    } catch (error) {
      message.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`https://note-n4cq.vercel.app/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      message.success('Note deleted');
      setConfirmVisible(false);
      setNoteToDelete(null);
      fetchNotes();
    } catch (error) {
      message.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (note = null) => {
    setCurrentNote(note);
    setModalVisible(true);
    form.setFieldsValue({ title: note?.title || '', content: note?.content || '' });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40, marginTop: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ marginTop: 64, padding: 16 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>My Notes</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} loading={submitting}>
          Add Note
        </Button>
      </div>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {notes.map(note => (
          <Card
            key={note.id}
            title={note.title}
            extra={
              <Space>
                <Button icon={<EditOutlined />} onClick={() => openModal(note)} loading={submitting} />
                <Button danger icon={<DeleteOutlined />} onClick={() => {
                  setConfirmVisible(true);
                  setNoteToDelete(note.id);
                }} loading={submitting} />
              </Space>
            }
          >
            <div style={{ whiteSpace: 'pre-line', marginBottom: 8 }}>
              {note.content}
            </div>
            <small style={{ color: '#666' }}>
              Last updated: {new Date(note.updated_at).toLocaleString()}
            </small>
          </Card>
        ))}
      </Space>

      <Modal
        title="Confirm Delete"
        open={confirmVisible}
        onOk={() => handleDelete(noteToDelete)}
        onCancel={() => {
          setConfirmVisible(false);
          setNoteToDelete(null);
        }}
        okText="Delete"
        okButtonProps={{ danger: true, loading: submitting }}
        cancelButtonProps={{ disabled: submitting }}
      >
        <p>Are you sure you want to delete this note?</p>
      </Modal>

      <Modal
        title={currentNote ? 'Edit Note' : 'Create Note'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setCurrentNote(null);
          form.resetFields();
        }}
        okText={currentNote ? 'Update' : 'Create'}
        okButtonProps={{ loading: submitting }}
        cancelButtonProps={{ disabled: submitting }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input disabled={submitting} />
          </Form.Item>
          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <TextArea rows={4} disabled={submitting} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotesPage;