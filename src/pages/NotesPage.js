import React, { useState, useEffect, useContext } from 'react';
import { Button, Modal, Form, Input, message, Spin, Table, InputNumber, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AuthContext from '../pages/AuthContext';

const { TextArea } = Input;

const NotesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { user } = useContext(AuthContext);

  // Generate random SKU
  const generateRandomSKU = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SKU-';
    
    // Generate 6 random characters
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Check if this SKU already exists
    const existingSKUs = items.map(item => item.sku);
    if (existingSKUs.includes(result)) {
      // If it exists, generate a new one recursively
      return generateRandomSKU();
    }
    
    return result;
  };

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://ren-uncw.onrender.com/api/inventory', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch inventory items');
      setItems(data.items);
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
      const url = currentItem 
        ? `https://ren-kua5.onrender.com/api/inventory/${currentItem.id}`
        : 'https://ren-kua5.onrender.com/api/inventory';
      
      const res = await fetch(url, {
        method: currentItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values)
      });

      if (!res.ok) throw new Error('Operation failed');
      
      message.success(currentItem ? 'Item updated successfully' : 'Item added successfully');
      setModalVisible(false);
      form.resetFields();
      setCurrentItem(null);
      fetchItems();
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
      const res = await fetch(`https://ren-kua5.onrender.com/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      message.success('Item deleted successfully');
      setConfirmVisible(false);
      setItemToDelete(null);
      fetchItems();
    } catch (error) {
      message.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (item = null) => {
    setCurrentItem(item);
    setModalVisible(true);
    
    // Set form values
    form.setFieldsValue({
      name: item?.name || '',
      description: item?.description || '',
      quantity: item?.quantity || 0,
      unit_price: item?.unit_price || 0,
      category: item?.category || '',
      supplier: item?.supplier || '',
      min_stock_level: item?.min_stock_level || 0,
      location: item?.location || '',
      sku: item?.sku || generateRandomSKU() // Generate random SKU for new items
    });
  };

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (text, record) => (
        <div>
          <strong>{text}</strong>
          {record.description && <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{record.description}</div>}
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 100,
      align: 'right',
      render: (price) => `$${(parseFloat(price) || 0).toFixed(2)}`,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 140,
    },
    {
      title: 'Min Stock',
      dataIndex: 'min_stock_level',
      key: 'min_stock_level',
      width: 100,
      align: 'center',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 140,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => openModal(record)} 
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => {
              setConfirmVisible(true);
              setItemToDelete(record.id);
            }} 
          />
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        marginTop: 64 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
      marginTop: 64, 
      padding: '16px',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <h2 style={{ margin: 0, fontSize: 'clamp(18px, 4vw, 24px)' }}>
          Inventory Management
        </h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => openModal()}
          size="middle"
        >
          Add Item
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={items}
        rowKey="id"
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        scroll={{ x: 1200 }}
        size="middle"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={confirmVisible}
        onOk={() => handleDelete(itemToDelete)}
        onCancel={() => {
          setConfirmVisible(false);
          setItemToDelete(null);
        }}
        okText="Delete"
        okButtonProps={{ danger: true, loading: submitting }}
        cancelButtonProps={{ disabled: submitting }}
        centered
      >
        <p>Are you sure you want to delete this inventory item?</p>
      </Modal>

      {/* Add/Edit Item Modal */}
      <Modal
        title={currentItem ? 'Edit Item' : 'Add New Item'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setCurrentItem(null);
          form.resetFields();
        }}
        okText={currentItem ? 'Update' : 'Add Item'}
        okButtonProps={{ loading: submitting }}
        cancelButtonProps={{ disabled: submitting }}
        width="90%"
        style={{ maxWidth: '800px' }}
        centered
      >
        <Form 
          form={form} 
          layout="vertical"
          style={{ marginTop: '16px' }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="name" 
                label="Item Name" 
                rules={[{ required: true, message: 'Please enter item name' }]}
              >
                <Input placeholder="Enter item name" size="middle" />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item 
                name="sku" 
                label="SKU" 
                rules={[{ required: true, message: 'SKU is required' }]}
              >
                <Input 
                  placeholder="Random SKU generated" 
                  size="middle"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item name="description" label="Description">
                <TextArea 
                  rows={3} 
                  placeholder="Item description (optional)" 
                  size="middle"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="category" 
                label="Category" 
                rules={[{ required: true, message: 'Please enter category' }]}
              >
                <Input placeholder="e.g., Electronics, Clothing" size="middle" />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item name="supplier" label="Supplier">
                <Input placeholder="Supplier name" size="middle" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Form.Item 
                name="quantity" 
                label="Quantity" 
                rules={[{ required: true, message: 'Please enter quantity' }]}
              >
                <InputNumber 
                  min={0} 
                  placeholder="0"
                  style={{ width: '100%' }}
                  size="middle"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={8}>
              <Form.Item 
                name="unit_price" 
                label="Unit Price ($)" 
                rules={[{ required: true, message: 'Please enter unit price' }]}
              >
                <InputNumber 
                  min={0} 
                  step={0.01} 
                  placeholder="0.00"
                  style={{ width: '100%' }}
                  size="middle"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={8}>
              <Form.Item 
                name="min_stock_level" 
                label="Min Stock Level" 
                rules={[{ required: true, message: 'Please enter minimum stock level' }]}
              >
                <InputNumber 
                  min={0} 
                  placeholder="0"
                  style={{ width: '100%' }}
                  size="middle"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item name="location" label="Storage Location">
                <Input placeholder="e.g., Warehouse A, Shelf 1" size="middle" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default NotesPage;