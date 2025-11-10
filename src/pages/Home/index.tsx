import { PurchaseAPI } from '@/services/purchase/PurchaseController';
import { PurchaseItem } from '@/services/purchase/typings';
import { BellOutlined, SmileOutlined } from '@ant-design/icons';
import { history, Navigate, useAccess } from '@umijs/max';
import { Badge, Button, Card, List, Result, Space } from 'antd';
import { useEffect, useState } from 'react';

const Home = () => {
  const { isLogin, purchaseAudit } = useAccess();
  const [pendingPurchases, setPendingPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取待审核的采购单
  const fetchPendingPurchases = async () => {
    if (!purchaseAudit) return;

    try {
      setLoading(true);
      const response = await PurchaseAPI.getAllPurchases({ status_codes: [2] });
      setPendingPurchases(response.data.purchase_list);
    } catch (error) {
      console.error('获取待审核采购单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPurchases();
  }, [purchaseAudit]);

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Result
        icon={<SmileOutlined />}
        title="欢迎使用奥吉通集采系统"
        subTitle="请选择上方的菜单进行操作，若无权限请联系管理员"
      />

      {/* 待办事项提醒 */}
      {purchaseAudit && pendingPurchases.length > 0 && (
        <Card
          title={
            <Space>
              <BellOutlined />
              待办事项
              <Badge count={pendingPurchases.length} />
            </Space>
          }
          style={{ marginTop: 24 }}
        >
          <List
            loading={loading}
            dataSource={pendingPurchases}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    key="view-detail"
                    type="link"
                    onClick={() => history.push(`/purchase/${item.id}`)}
                  >
                    查看详情
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={`采购单 ${item.purchase_no}`}
                  description={`${item.store_name} - ${item.creator_name} - ${item.create_time}`}
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};

export default Home;
